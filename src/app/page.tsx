import { api } from "@/api/api";
import styles from "./page.module.css";
import { RegionCard } from "./region-card";

export default async function HomePage() {
  const { data } = await api.get("/getLeagues", {
    query: {
      hl: "en-US",
    },
  });

  const regions = [
    {
      name: "Europe, Middle East, and Africa",
      region: "EMEA",
      className: styles.EMEA,
    },
    {
      name: "Latin America",
      region: "LATIN AMERICA",
      className: styles.LATIN_AMERICA,
    },
    {
      name: "Latin America South",
      region: "LATIN AMERICA NORTH",
      className: styles.LATIN_AMERICA_SOUTH,
    },
    {
      name: "Latin America North",
      region: "LATIN AMERICA SOUTH",
      className: styles.LATIN_AMERICA_NORTH,
    },
    {
      name: "North America",
      region: "NORTH AMERICA",
      className: styles.NORTH_AMERICA,
    },
    {
      name: "Japan",
      region: "JAPAN",
      className: styles.JAPAN,
    },
    {
      name: "Korea",
      region: "KOREA",
      className: styles.KOREA,
    },
    {
      name: "China",
      region: "CHINA",
      className: styles.CHINA,
      cols: 1,
    },
    {
      name: "Vietnam",
      region: "VIETNAM",
      className: styles.VIETNAM,
      cols: 1,
    },
    {
      name: "Southeast Asia",
      region: "HONG KONG, MACAU, TAIWAN",
      className: styles.HONG_KONG_MACAU_TAIWAN,
      cols: 1,
    },
    {
      name: "Russia",
      region: "COMMONWEALTH OF INDEPENDENT STATES",
      className: styles.COMMONWEALTH_OF_INDEPENDENT_STATES,
      cols: 1,
    },
    {
      name: "Brazil",
      region: "BRAZIL",
      className: styles.BRAZIL,
    },

    {
      name: "Oceania",
      region: "OCEANIA",
      className: styles.OCEANIA,
      cols: 1,
    },
  ];

  return (
    <main className="h-full bg-black relative flex">
      <div
        className={`h-full w-full ${styles.stripes} ${styles.worldMap} fixed`}
      ></div>
      <div className={styles.grid}>
        {regions.map(({ region, name, className, cols }) => {
          const items = data.leagues.filter((item) => item.region === region);
          return (
            <RegionCard
              key={region}
              items={items}
              title={name}
              className={className}
              cols={cols}
            />
          );
        })}
        <RegionCard
          title="Other"
          items={data.leagues.filter(
            (item) => !regions.some(({ region }) => region === item.region)
          )}
          className={styles.REST}
        />
      </div>
    </main>
  );
}
