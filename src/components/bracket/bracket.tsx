import { Text } from "@mantine/core";
import { useMemo, useState } from "react";
import type { StandingsSection } from "@/api/types";
import classes from "./bracket.module.css";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  type Edge,
  type Layout,
  type MatchNode,
  OUTCOME_ROW,
  POOL_HEADER,
  type Team,
  describeOrigin,
  isTbd,
  layoutSection,
} from "./layout";

/** A polyline with rounded corners, as an SVG path. */
function roundedPath(points: [number, number][], radius = 8) {
  let path = `M ${points[0][0]} ${points[0][1]}`;
  for (let index = 1; index < points.length - 1; index++) {
    const [px, py] = points[index - 1];
    const [x, y] = points[index];
    const [nx, ny] = points[index + 1];
    const before = Math.min(radius, Math.hypot(x - px, y - py) / 2);
    const after = Math.min(radius, Math.hypot(nx - x, ny - y) / 2);
    const inX = x - Math.sign(x - px) * before;
    const inY = y - Math.sign(y - py) * before;
    const outX = x + Math.sign(nx - x) * after;
    const outY = y + Math.sign(ny - y) * after;
    path += ` L ${inX} ${inY} Q ${x} ${y} ${outX} ${outY}`;
  }
  const [lastX, lastY] = points.at(-1)!;
  return `${path} L ${lastX} ${lastY}`;
}

const formatRecord = (wins: number, losses: number) =>
  wins < 0 ? "To be decided" : `${wins}–${losses}`;

export function Bracket({ section }: { section: StandingsSection }) {
  const layout = useMemo(() => layoutSection(section), [section]);
  // The team whose path is highlighted, while hovering or after tapping it.
  const [focus, setFocus] = useState<string>();

  const nodesById = useMemo(
    () => new Map(layout.nodes.map((node) => [node.match.structuralId, node])),
    [layout],
  );

  const plays = (node: MatchNode | undefined) =>
    focus !== undefined && node?.match.teams.some((team) => team.code === focus);
  const onPath = (edge: Edge) => {
    const target = nodesById.get(edge.to);
    return (
      focus !== undefined &&
      target?.match.teams[edge.slot]?.code === focus &&
      plays(nodesById.get(edge.from))
    );
  };

  // A mouse follows a team while hovering it; touch toggles it with a tap.
  const focusProps = (team: Team) =>
    isTbd(team)
      ? {}
      : {
          onPointerEnter: (event: React.PointerEvent) => {
            if (event.pointerType === "mouse") setFocus(team.code);
          },
          onPointerUp: (event: React.PointerEvent) => {
            if (event.pointerType !== "mouse") {
              setFocus((current) => (current === team.code ? undefined : team.code));
            }
          },
        };

  return (
    <div className={classes.scroller}>
      <div
        className={classes.canvas}
        style={{ width: layout.width, height: layout.height }}
        data-focused={focus !== undefined || undefined}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") setFocus(undefined);
        }}
      >
        <svg className={classes.lines} width={layout.width} height={layout.height} aria-hidden>
          {layout.poolLinks.map((link) => (
            <path
              key={link.id}
              d={roundedPath(link.points)}
              className={classes.poolLink}
              data-outcome={link.outcome}
            />
          ))}
          {layout.edges.map((edge) => {
            const highlighted = onPath(edge);
            if (edge.hidden && !highlighted) return null;
            return (
              <path
                key={edge.id}
                d={roundedPath(edge.points)}
                className={classes.edge}
                data-outcome={edge.outcome}
                data-highlighted={highlighted || undefined}
              />
            );
          })}
        </svg>

        {layout.titles.map((title) => (
          <div
            key={`${title.variant}-${title.x}-${title.y}`}
            className={classes.title}
            data-variant={title.variant}
            style={{ left: title.x, top: title.y, width: title.width || undefined }}
          >
            {title.text}
          </div>
        ))}

        {layout.pools.map((pool) => (
          <div
            key={pool.key}
            className={classes.pool}
            style={{ left: pool.x, top: pool.y, width: pool.width, height: pool.height }}
          >
            <div className={classes.poolHeader} style={{ height: POOL_HEADER }}>
              {formatRecord(pool.wins, pool.losses)}
            </div>
          </div>
        ))}

        <Outcomes layout={layout} focus={focus} focusProps={focusProps} />

        {layout.nodes.map((node) => (
          <MatchCard
            key={node.match.structuralId}
            node={node}
            nodesById={nodesById}
            focus={focus}
            focusProps={focusProps}
          />
        ))}
      </div>
    </div>
  );
}

function MatchCard({
  node,
  nodesById,
  focus,
  focusProps,
}: {
  node: MatchNode;
  nodesById: Map<string, MatchNode>;
  focus: string | undefined;
  focusProps: (team: Team) => object;
}) {
  const { match } = node;
  const played = match.state !== "unstarted";

  return (
    <div
      className={classes.match}
      style={{ left: node.x, top: node.y, width: CARD_WIDTH, height: CARD_HEIGHT }}
      data-state={match.state}
      data-focused={match.teams.some((team) => team.code === focus) || undefined}
      title={match.state === "inProgress" ? `${node.label} (live)` : node.label}
    >
      {match.teams.map((team, index) => {
        const tbd = isTbd(team);
        const outcome = team.result?.outcome;
        return (
          <div
            // Teams can repeat as TBD, so the slot is the key.
            key={index}
            className={classes.team}
            data-outcome={outcome ?? undefined}
            data-focused={team.code === focus || undefined}
            {...focusProps(team)}
          >
            {tbd ? (
              <span className={classes.origin}>{describeOrigin(team, nodesById) ?? "TBD"}</span>
            ) : (
              <>
                <img src={team.image} alt="" width={20} height={20} loading="lazy" />
                <span className={classes.name} title={team.name}>
                  {team.name}
                </span>
                {played && <span className={classes.score}>{team.result?.gameWins ?? 0}</span>}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Outcomes({
  layout,
  focus,
  focusProps,
}: {
  layout: Layout;
  focus: string | undefined;
  focusProps: (team: Team) => object;
}) {
  return layout.outcomes.map((group) => (
    <div
      key={group.key}
      className={classes.outcome}
      data-status={group.status}
      style={{ left: group.x, top: group.y, width: group.width, height: group.height }}
    >
      <div className={classes.poolHeader} style={{ height: POOL_HEADER }}>
        {formatRecord(group.wins, group.losses)}
        {group.status !== "final" && (
          <span className={classes.status}>
            {group.status === "advanced" ? "Advanced" : "Eliminated"}
          </span>
        )}
      </div>
      {Array.from({ length: group.slots }, (_, index) => {
        const team = group.teams[index];
        return team ? (
          <div
            key={team.code}
            className={classes.outcomeTeam}
            style={{ height: OUTCOME_ROW }}
            data-focused={team.code === focus || undefined}
            {...focusProps(team)}
          >
            <img src={team.image} alt="" width={18} height={18} loading="lazy" />
            <span className={classes.name}>{team.name}</span>
          </div>
        ) : (
          <div key={index} className={classes.outcomeTeam} style={{ height: OUTCOME_ROW }}>
            <Text span fz="xs" c="dimmed">
              TBD
            </Text>
          </div>
        );
      })}
    </div>
  ));
}
