import { Get } from "@kiyoshiro/openapi-typescript-any-client"

export interface paths {
  "/getLeagues": {
    get: operations["getLeagues"];
  };
  "/getSchedule": {
    get: operations["getSchedule"];
  };
  "/getLive": {
    get: operations["getLive"];
  };
  "/getTournamentsForLeague": {
    get: operations["getTournamentsForLeague"];
  };
  "/getStandings": {
    get: operations["getStandings"];
  };
  "/getStandingsV3": {
    get: operations["getStandingsV3"];
  };
  "/getCompletedEvents": {
    get: operations["getCompletedEvents"];
  };
  "/getEventDetails": {
    get: operations["getEventDetails"];
  };
  "/getTeams": {
    get: operations["getTeams"];
  };
  "/getGames": {
    get: operations["getGames"];
  };
  "/window/{gameId}": {
    get: operations["getWindow"];
  };
  "/details/{gameId}": {
    get: operations["getDetails"];
  };
  "/navItems": {
    get: operations["navItems"];
  };
  "/videos": {
    /**
     * @description This endpoint returns details about esports vods on YouTube.
     * 
     * The data returned by this endpoint is fairly large (more than 5MB) since
     * it includes vods from 2015 up to (at the time of writing this) June 2019
     * and it will continue growing.
     * 
     * Do consider this when dealing with clients (like mobile phones) where
     * bandwidth and memory may be scarce.
     * 
     * It is highly advised that you cache the data from this endpoint.
     */
    get: operations["videos"];
  };
  "/highlanderTournaments": {
    /** @description If a league does not have highlanderTournament objects, the API will return 404 */
    get: operations["highlanderTournaments"];
  };
  "/leagues": {
    get: operations["leagues"];
  };
  "/scheduleItems": {
    get: operations["scheduleItems"];
  };
  "/teams": {
    /**
     * @description If the `teamStatsSummaries`, `teamRosterStats` and `teamStatsHistories` keys are not present,
     * then the team did not take part in that particular tournament.
     */
    get: operations["teams"];
  };
  "/players": {
    /**
     * @description If the `playerStatsSummaries` and `playerStatsHistories` keys are not present,
     * then the player did not take part in that particular tournament.
     */
    get: operations["players"];
  };
}
/** OneOf type helpers */
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
type OneOf<T extends any[]> = T extends [infer Only] ? Only : T extends [infer A, infer B, ...infer Rest] ? OneOf<[XOR<A, B>, ...Rest]> : never;


export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    /**
     * Format: byte 
     * @description Base 64 encoded string used to determine the
     * next "page" of data to pull
     */
    pageToken: string | null;
    baseLeague: {
      /** @description The name of the league */
      name: string;
      /** @description URL friendly version of the league's name */
      slug: string;
    };
    simpleLeague: components["schemas"]["baseLeague"] & {
      /** @description The league's ID */
      id: string;
      /** @description URL to an image of the League's logo */
      image: string;
    };
    extendedLeague: components["schemas"]["simpleLeague"] & {
      /** @description Unknown */
      priority: number;
    };
    highlanderLeague: components["schemas"]["baseLeague"] & ({
      /** @description The league's ID */
      id: number;
      /** @description The [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) for the league. */
      guid: string;
      region: string;
      drupalId: number | null;
      logoUrl: string;
      /**
       * Format: date-time 
       * @description The date and time when this entry was created.
       */
      createdAt: string;
      /**
       * Format: date-time 
       * @description The date and time when this entry was last updated.
       */
      updatedAt: string;
      /**
       * @description Contains a description of the league translated in various languages.
       * 
       * The keys are presented in the format ([ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1)
       * and [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2))
       * 
       * `{languageCode}_{countryCode}`
       * 
       * The value is a string containing
       * html tags representing the description in that specific locale.
       */
      abouts: {
        [key: string]: string | undefined;
      };
      /**
       * @description Contains the names of the league translated in various languages.
       * 
       * The keys are presented in the format ([ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1)
       * and [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2))
       * 
       * `{languageCode}_{countryCode}`
       * 
       * The value is a string containing
       * the name of the league in that specific locale.
       */
      names: {
        [key: string]: string | undefined;
      };
      /**
       * @description An array containing the [UUIDs](https://en.wikipedia.org/wiki/Universally_unique_identifier)
       * for the tournaments in this league.
       */
      tournaments?: (string)[];
    });
    /**
     * @description Describes the amount of wins and losses the team has incurred
     * in a particular stage of the tournament specifically group stage
     * 
     * For knockout phase, each series is treated individually.
     * 
     * This object is null when the match is ongoing and it is in the
     * knockout stage.
     */
    record: {
      losses: number;
      wins: number;
    } | null;
    result: {
      /**
       * @description The number of games the team has won in that
       * in the series
       */
      gameWins: number;
    };
    /**
     * @description Indicate whether the team won or lost the series
     * 
     * This will be null if the match is ongoing
     *  
     * @enum {string|null}
     */
    outcome: "loss" | "win" | null;
    team: {
      code: string;
      image: string;
      name: string;
    };
    customTeam: {
      id: components["schemas"]["teamId"];
      /** @enum {string} */
      side: "blue" | "red";
    };
    extendedTeam: components["schemas"]["team"] & {
      id: components["schemas"]["teamId"];
      slug: components["schemas"]["teamSlug"];
      alternativeImage: string;
      homeLeague: components["schemas"]["homeLeague"];
      players: (components["schemas"]["player"])[];
    };
    homeLeague: {
      /** @description The name of the league */
      name: string;
      /** @description The region where the league is located */
      region: string;
    };
    /** @description The URL friendly version of the team name */
    teamSlug: string;
    /** @description The team id */
    teamId: string;
    baseStrategy: {
      /** @enum {integer} */
      count: 1 | 3 | 5;
    };
    strategy: components["schemas"]["baseStrategy"] & {
      /** @enum {string} */
      type: "bestOf";
    };
    teams: (components["schemas"]["team"])[];
    baseMatch: {
      teams: components["schemas"]["teams"];
    };
    simpleMatch: components["schemas"]["baseMatch"] & {
      /** @description The match id */
      id: string;
    };
    /** @enum {string} */
    state: "completed" | "unstarted" | "inProgress";
    /** @enum {string} */
    eventType: "match" | "show";
    baseEvent: {
      match?: components["schemas"]["baseMatch"];
    };
    simpleEvent: {
      /**
       * Format: date-time 
       * @description The time the match started
       */
      startTime: string;
      blockName: string | null;
      match: components["schemas"]["simpleMatch"] & {
        strategy: components["schemas"]["strategy"];
        teams: ({
            result: components["schemas"]["result"];
          })[];
      };
    };
    extendedEvent: components["schemas"]["simpleEvent"] & {
      state: components["schemas"]["state"];
      type: components["schemas"]["eventType"];
    };
    tournament: {
      /**
       * Format: full-date 
       * @description The date the tournament ends/ended.
       */
      endDate: string;
      /** @description This is the tournament id */
      id: string;
      slug: string;
      /**
       * Format: full-date 
       * @description The date the tournament starts/started.
       */
      startDate: string;
    };
    /**
     * @description Represents a stage in a tournament.
     * 
     * Whether it is the group or knockout stage.
     */
    stage: {
      /** @description The name of that stage of the tournament */
      name: string;
      /**
       * @description The type of the stage. 
       * @enum {string}
       */
      type: "groups" | "bracket";
      slug: string;
      /**
       * @description Each object in the array represents a particular round in that
       * specific stage in the tournament.
       * 
       * For the knockout stages, we could have the quarter finals,
       * semi finals and the finals under their own sections.
       * 
       * For the group stage, there is usually only one section.
       */
      sections: (components["schemas"]["section"])[];
    };
    standing: {
      id: string;
      name: string;
      slug: string;
      scores: (Record<string, never>)[];
      split: {
        id: string;
      };
      season: {
        id: string;
        name: string;
        slug: string;
        status: string;
        startTime: string;
        endTime: string;
        splits: ({
            id: string;
            name: string;
            slug: string;
            startTime: string;
            endTime: string;
          })[];
      };
      stages: ({
          name: string;
          slug: string;
          sections: ({
              id: string;
              name: string;
              type: string;
              columns: ({
                  cells: ({
                      name: string;
                      slug: string;
                      matches: ({
                          id: string;
                          structuralId: string;
                          state: string;
                          teams: ({
                              id: string;
                              slug: string;
                              name: string;
                              code: string;
                              image: string;
                              result: (components["schemas"]["result"] & {
                                outcome?: components["schemas"]["outcome"];
                              }) | null;
                              origin: {
                                structuralId: string;
                                type: string;
                                slot: number;
                              };
                            })[];
                        })[];
                    })[];
                })[];
              rankings: ({
                  ordinal: number;
                  teams: ({
                      id: string;
                      slug: string;
                      name: string;
                      code: string;
                      image: string;
                      record: {
                        wins: number;
                        ties: number;
                        losses: number;
                      };
                    })[];
                })[];
            })[];
        })[];
    };
    section: {
      /** @description The name of the section */
      name: string;
      matches: (components["schemas"]["simpleMatch"] & ({
          state: components["schemas"]["state"];
          /**
           * @description This stores the previous match ids for the teams in the current
           * match were involved in.
           * 
           * For group stages this is usually null. For bracket stage it is
           * used to indicate the matches that were played before the match
           * in question.
           */
          previousMatchIds: (string)[] | null;
          /**
           * @description The purpose of this key is unknown. So far the only value it
           * has seems to be null.
           */
          flags: string | null;
          teams: ({
              id: components["schemas"]["teamId"];
              slug: components["schemas"]["teamSlug"];
              result: components["schemas"]["result"] & {
                outcome?: components["schemas"]["outcome"];
              };
            })[];
        }))[];
      /**
       * @description Contains details about the actual standings for that particular
       * section
       * 
       * This is mostly used for the group stage. For the knockout stages, it
       * is usually empty.
       */
      rankings: (components["schemas"]["ranking"])[];
    };
    ranking: {
      /** @description The league position */
      ordinal: number;
      /**
       * @description The teams that are at that league position.
       * 
       * In most cases there will only be one team object in this array. In
       * cases where several teams are tied with the same score, this array will
       * contain all teams tied for that position.
       */
      teams: (components["schemas"]["team"] & {
          id?: components["schemas"]["teamId"];
          slug?: components["schemas"]["teamSlug"];
          record?: components["schemas"]["record"];
        })[];
    };
    game: {
      vods: (components["schemas"]["vod"])[];
    };
    simpleGame: {
      /** @description The game ID */
      id: string;
      state: components["schemas"]["state"];
      /**
       * @description The number of the game 
       * @enum {integer}
       */
      number: 1 | 2 | 3 | 4 | 5;
      vods: (components["schemas"]["extendedVod"])[];
    };
    extendedGame: components["schemas"]["simpleGame"] & {
      teams: (components["schemas"]["customTeam"])[];
    };
    vod: {
      parameter: string;
    };
    extendedVod: components["schemas"]["vod"] & ({
      locale: components["schemas"]["locale"];
      /**
       * @description The platform that is hosting the vod
       *  
       * @enum {string}
       */
      provider: "youtube" | "twitch";
      /** @description Purpose Unknown */
      offset: number;
    });
    /**
     * @description This is the locale or language code using [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1)
     * and [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)
     *  
     * @enum {string}
     */
    locale: "en-US" | "en-GB" | "en-AU" | "cs-CZ" | "de-DE" | "el-GR" | "es-ES" | "es-MX" | "fr-FR" | "hu-HU" | "it-IT" | "pl-PL" | "pt-BR" | "ro-RO" | "ru-RU" | "tr-TR" | "ja-JP" | "ko-KR";
    player: {
      id: string;
      summonerName: string;
      firstName: string;
      lastName: string;
      image: string;
      role: string;
    };
    window: {
      /** @description The game Id of the match */
      esportsGameId: string;
      /** @description The match Id of the match */
      esportsMatchId: string;
      gameMetadata: components["schemas"]["gameMetadata"];
      frames: (components["schemas"]["windowFrame"])[];
    };
    gameMetadata: {
      /** @description The patch the match was played on */
      patchVersion: string;
      blueTeamMetadata: components["schemas"]["teamMetadata"];
      redTeamMetadata: components["schemas"]["teamMetadata"];
    };
    teamMetadata: {
      /** @description The team Id */
      esportsTeamId: string;
      participantMetadata: (components["schemas"]["participantMetadata"] | components["schemas"]["participantMetadataExtended"])[];
    };
    participantMetadata: {
      participantId: components["schemas"]["participantId"];
      summonerName: string;
      championId: string;
      /** @enum {string} */
      role: "top" | "jungle" | "mid" | "bottom" | "support";
    };
    participantMetadataExtended: components["schemas"]["participantMetadata"] & {
      esportsPlayerId: string;
    };
    /** @enum {integer} */
    participantId: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    baseFrame: {
      /** Format: date-time */
      rfc460Timestamp: string;
    };
    windowFrame: components["schemas"]["baseFrame"] & ({
      /** Format: date-time */
      rfc460Timestamp: string;
      /** @enum {string} */
      gameState: "in_game" | "finished";
      blueTeam: components["schemas"]["teamStats"];
      redTeam: components["schemas"]["teamStats"];
    });
    detailsFrame: components["schemas"]["baseFrame"] & {
      participants: (components["schemas"]["extendedParticipantStats"])[];
    };
    teamStats: {
      totalGold: number;
      inhibitors: number;
      towers: number;
      barons: number;
      totalKills: number;
      dragons: ("ocean" | "mountain" | "infernal" | "cloud" | "elder")[];
      participants: (components["schemas"]["participantStats"])[];
    };
    baseParticipantStats: {
      participantId: components["schemas"]["participantId"];
      level: number;
      kills: number;
      deaths: number;
      assists: number;
      creepScore: number;
    };
    participantStats: components["schemas"]["baseParticipantStats"] & {
      totalGold: number;
      currentHealth: number;
      maxHealth: number;
    };
    extendedParticipantStats: components["schemas"]["participantStats"] & {
      totalGoldEarned: number;
      /** Format: float */
      killParticipation: number;
      /** Format: float */
      championDamageShare: number;
      wardsPlaced: number;
      wardsDestroyed: number;
      attackDamage: number;
      abilityPower: number;
      /** Format: float */
      criticalChance: number;
      attackSpeed: number;
      lifeSteal: number;
      armor: number;
      magicResistance: number;
      /** Format: float */
      tenacity: number;
      /** @description Contains the item Ids of the items in the inventory */
      items: (number)[];
      perkMetadata: components["schemas"]["perkMetadata"];
      abilities: components["schemas"]["abilities"];
    };
    perkMetadata: {
      /**
       * @description The id of the primary rune path
       *  
       * @enum {integer}
       */
      styleId: 8000 | 8100 | 8200 | 8300 | 8400;
      /**
       * @description The id of the secondary rune path
       *  
       * @enum {integer}
       */
      subStyleId: 8000 | 8100 | 8200 | 8300 | 8400;
      /**
       * @description The runes selected.
       * 
       * Index 0 - 3 are the ids of the primary runes
       * Index 4 - 5 are the ids of the secondary runes
       * Index 6 - 8 are the ids of the stats shard
       */
      perks: (number)[];
    };
    /** @description Contains the abilities the summoner levelled up at each level */
    abilities: ("Q" | "W" | "E" | "R")[];
    navItem: {
      id: number;
      link: string;
      slug: string | null;
      label: string;
      imageUrl: string | null;
      order: number;
      external: boolean;
      parentNavItem: components["schemas"]["navItem"] & (Record<string, unknown> | null);
      /**
       * Format: date-time 
       * @description The date and time when this entry was created.
       */
      createdAt: string;
      /**
       * Format: date-time 
       * @description The date and time when this entry was last updated.
       */
      updatedAt: string;
    };
    video: {
      id: number;
      slug: string | null;
      label: string | null;
      /**
       * @description The video's locale. The value is a [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1)
       * language code.
       */
      locale: string;
      /** @description Contains the tournament Id and the game Id of that match. */
      reference: string;
      /** @description URL to the YouTube video of the match */
      source: string;
      /**
       * Format: date-time 
       * @description The date and time when this entry was created.
       */
      createdAt: string;
      /**
       * Format: date-time 
       * @description The date and time when this entry was last updated.
       */
      updatedAt: string;
      game: components["schemas"]["gameId"];
    };
    /**
     * @description The game Id of the match.
     * 
     * It is a [UUID version 4](https://en.wikipedia.org/wiki/Universally_unique_identifier)
     */
    gameId: string;
    highlanderTournaments: (components["schemas"]["highlanderTournament"])[];
    highlanderTournament: {
      /**
       * @description The tournament Id
       * 
       * It is a [UUID version 4](https://en.wikipedia.org/wiki/Universally_unique_identifier)
       */
      id: string;
      /** @description URL friendly version of the tournament name */
      title: string;
      /** @description The tournament's name */
      description: string;
      /** @description The integer in the string represents the league ID. */
      leagueReference: string;
      roles: components["schemas"]["roles"];
      bracketType?: components["schemas"]["bracketType"];
      matchType?: components["schemas"]["matchType"];
      rosteringStrategy?: components["schemas"]["rosteringStrategy"];
      seedingStrategy?: components["schemas"]["rosteringStrategy"];
      queues: Record<string, never>;
      /**
       * @description The keys to this object are [UUID version 4](https://en.wikipedia.org/wiki/Universally_unique_identifier)
       * representing the roster ID.
       * 
       * Their values are objects but they don't contain anything useful about the roster.
       */
      rosters: {
        [key: string]: {
          /**
           * @description The roster ID.
           * 
           * It is a [UUID version 4](https://en.wikipedia.org/wiki/Universally_unique_identifier)
           */
          id: string;
          /** @enum {string} */
          state?: "eliminated";
          /** @description The abbreviated version of the team's name. */
          name: string;
          roles: Record<string, never>;
          teamReference: string;
          substitutions: Record<string, never>;
          /** @description The Team ID */
          team: string;
        } | undefined;
      };
      /**
       * @description If the value is true then the league/tournament has concluded, otherwise it is ongoing.
       *  
       * @enum {boolean}
       */
      published: true | false;
      breakpoints?: components["schemas"]["breakpoints"];
      brackets: components["schemas"]["brackets"];
      standings?: components["schemas"]["standings"];
      /**
       * @description The array contains [UUID version 4](https://en.wikipedia.org/wiki/Universally_unique_identifier) Match IDs
       * 
       * Despite the name of this property it is unreliable as for some tournaments this array will
       * contain match IDs yet the matches are over.
       */
      liveMatches: (string)[];
      /**
       * Format: date 
       * @description The day the tournament starts/started.
       */
      startDate: string;
      /**
       * Format: date 
       * @description The day the tournament ends/ended.
       */
      endDate: string;
      /**
       * @description Contains all the platform IDs in for this tournaments.
       * 
       * A platform ID is combination of the gameRealm and the gameId.
       * The regex below describes the format.
       * 
       * `^[A-Z]+\d+:\d+$`
       */
      platformIds: (string)[];
      /**
       * @description 'Contains all the gameIds in this tournament.
       * 
       * **Note:** The gameIds are in the format [UUID version 4](https://en.wikipedia.org/wiki/Universally_unique_identifier)'
       */
      gameIds: (string)[];
      /** @description The league ID */
      leagueId: string;
      /** @description The league ID */
      league: string;
    };
    rosteringStrategy: {
      /** @enum {string} */
      identifier: "passthru" | "random";
    };
    roles: {
      creator: (components["schemas"]["role"])[];
      owner: (components["schemas"]["role"])[];
    };
    role: {
      /** @enum {string} */
      origin: "BEARER_TOKEN";
      /** @enum {string} */
      region: "global";
      /** @enum {string} */
      summonerName: "test-user";
      /** @enum {integer} */
      summonerLevel: 0;
      /** @enum {integer} */
      profileIconId: 0;
      /** @enum {boolean} */
      admin: true;
    };
    simpleRoster: {
      /** @description The roster ID */
      roster?: string;
    };
    /**
     * @description The keys to this object are [UUID version 4](https://en.wikipedia.org/wiki/Universally_unique_identifier)
     * representing the roster ID.
     */
    breakpoints: {
      [key: string]: ({
        /** @description The breakpoint's ID */
        id: string;
        name: string;
        position: number;
        input: (components["schemas"]["simpleRoster"] & {
            /** @description The bracket ID */
            bracket?: string;
            standing?: number;
          })[];
        standings?: components["schemas"]["standings"];
        scores: components["schemas"]["scores"];
        roles: components["schemas"]["roles"];
        generator: {
          /** @enum {string} */
          identifier?: "noop";
        };
      }) | undefined;
    };
    standings: {
      result: components["schemas"]["highlanderResult"];
      /**
       * Format: int64 
       * @description Unix timestamp in milliseconds of when the match started.
       */
      timestamp: number;
      /**
       * @description How the record was created/updated. 
       * @enum {string}
       */
      source?: "manual" | "bestOf";
      note?: string;
      history?: (components["schemas"]["standings"])[];
      /**
       * @description If the value is true then the league/tournament has concluded, otherwise it is ongoing.
       *  
       * @enum {boolean}
       */
      closed: true | false;
    };
    highlanderResult: ((components["schemas"]["simpleRoster"])[])[];
    /**
     * @description The keys to this object are [UUID version 4](https://en.wikipedia.org/wiki/Universally_unique_identifier)
     * representing the bracket ID.
     */
    brackets: {
      [key: string]: ({
        /** @description The bracket ID. */
        id: string;
        /** @description The name of the bracket */
        name: string;
        position: number;
        groupPosition: number;
        groupName?: string;
        canManufacture: boolean;
        /**
         * @description Whether it is ongoing or completed.
         * 
         * This is unreliable since some tournaments have the state unresolved yet they concluded
         * a long time ago.
         *  
         * @enum {string}
         */
        state: "resolved" | "unresolved" | "unlinked";
        bracketType?: components["schemas"]["bracketType"];
        matchType?: components["schemas"]["matchType"];
        gameMode?: components["schemas"]["gameMode"];
        input?: (components["schemas"]["simpleRoster"] & {
            /** @description The breakpoint ID */
            breakpoint?: string;
            standing?: number;
          })[];
        /**
         * @description The keys to this object are [UUID version 4](https://en.wikipedia.org/wiki/Universally_unique_identifier)
         * representing the match ID.
         */
        matches: {
          [key: string]: components["schemas"]["highlanderMatch"] | undefined;
        };
        standings?: components["schemas"]["standings"];
        inheritableMatchScoringStrategy?: components["schemas"]["scoring"];
        roles: components["schemas"]["roles"];
        scoring?: components["schemas"]["scoring"];
        scores: components["schemas"]["scores"];
        matchScoring?: components["schemas"]["scoring"];
        matchScores: components["schemas"]["scores"];
      }) | undefined;
    };
    bracketType: {
      /** @enum {string} */
      identifier: "round_robin" | "single_elim" | "gauntlet" | "bestOf";
      options?: {
        rounds: string;
      };
    };
    matchType: {
      /** @enum {string} */
      identifier: "bestOf" | "single_elim";
      options?: {
        best_of: string;
      };
    };
    gameMode: {
      /** @enum {string} */
      identifier: "lol:duel" | "lol:classic";
      /** @enum {integer} */
      requiredPlayers: 1 | 5;
      /** @enum {string} */
      mapName: "summoner_rift" | "howling_abyss";
    };
    highlanderMatch: {
      /** @description The match ID */
      id: string;
      name: string;
      position: number;
      /**
       * @description Whether it is ongoing or completed.
       *  
       * @enum {string}
       */
      state: "resolved" | "unresolved" | "unlinked";
      groupPosition: number;
      matchType?: components["schemas"]["matchType"];
      gameMode?: components["schemas"]["gameMode"];
      input: (components["schemas"]["simpleRoster"] & OneOf<[{
          /** @description The match ID */
          match?: string;
        }, {
          /** @description The breakpoint ID */
          breakpoint?: string;
        }]> & {
          standing?: number;
        })[];
      /**
       * @description The keys to this object are [UUID version 4](https://en.wikipedia.org/wiki/Universally_unique_identifier)
       * representing the game ID.
       * 
       * These are the games played in that series.
       * 
       * The number of properties(key and value pair) in this object will be equal to the type of series that was
       * played. For a best of 1 there will be only 1 game, 3 for best of 3s and 5 for best of 5s.
       */
      games: {
        [key: string]: components["schemas"]["highlanderGame"] | undefined;
      };
      standings?: components["schemas"]["standings"];
      /** @enum {boolean} */
      tiebreaker: true | false;
      remadeGames: (components["schemas"]["highlanderGame"])[];
      roles: components["schemas"]["roles"];
      scoring?: components["schemas"]["scoring"];
      scores: components["schemas"]["scores"];
    };
    highlanderGame: {
      id: components["schemas"]["gameId"];
      name: string;
      generatedName: string;
      /** @enum {string} */
      state?: "remade";
      gameMode?: components["schemas"]["gameMode"];
      input: (components["schemas"]["simpleRoster"] & OneOf<[{
          /** @description The match ID */
          match?: string;
        }, {
          /** @description The breakpoint ID */
          breakpoint?: string;
        }]> & {
          standing?: number;
        })[];
      standings?: components["schemas"]["standings"];
      scores: components["schemas"]["scores"];
      /**
       * @description The numeric version of the game ID
       * 
       * This is what is used to access the ACS endpoint.
       */
      gameId?: string;
      /** @description The ID of the tournament realm on which the game was played on */
      gameRealm?: string;
      /** @description A combination of the gameRealm and the gameId */
      platformId?: string;
      revision: number;
      roles: components["schemas"]["roles"];
    };
    scoring: {
      /**
       * @description **Note:** The `LegacyScoringStrategy` value has only been found in the 2015 worlds championship. 
       * @enum {string}
       */
      identifier: "standard" | "LegacyScoringStrategy";
      options: {
        points: (number)[];
      };
    };
    /**
     * @description The keys to this object are [UUID version 4](https://en.wikipedia.org/wiki/Universally_unique_identifier)
     * representing the roster ID.
     */
    scores: {
      [key: string]: number | undefined;
    };
    highlanderRecords: (components["schemas"]["highlanderRecord"])[];
    highlanderRecord: {
      wins: number;
      losses: number;
      ties: number;
      score: number;
      /** @description The roster's [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) */
      roster: string;
      /** @description The tournament's [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) */
      tournament: string;
      /** @description The bracket's [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) */
      bracket: string;
      /** @description A combination of the bracket and roster UUIDs. The two are separated by a colon\ */
      id: string;
    };
    highlanderTeam: {
      /** @description The team ID. */
      id: number;
      /** @description URL friendly version of the team name. */
      slug: string;
      /** @description The team name. */
      name: string;
      /** @description The team's [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier). */
      guid: string;
      teamPhotoUrl: string | null;
      /** @description URL to an image of the team's logo. */
      logoUrl: string;
      /** @description The acronym form of the team name */
      acronym: string;
      /** @description Describes the league this team participates in during the regular seasons. */
      homeLeague: string;
      /** @description Alternative URL to the team's logo. */
      altLogoUrl: string | null;
      /**
       * Format: date-time 
       * @description The date and time when this entry was created.
       */
      createdAt: string;
      /**
       * Format: date-time 
       * @description The date and time when this entry was last updated.
       */
      updatedAt: string;
      /**
       * @description Contains a description of the team translated to various languages.
       * 
       * The keys are presented in the format ([ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1)
       * and [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2))
       * 
       * `{languageCode}_{countryCode}`
       * 
       * The value is a string containing
       * html tags representing the description in that specific locale.
       */
      bios: {
        [key: string]: string | undefined;
      };
      foreignIds: components["schemas"]["foreignIds"];
      /** @description An array containing the player IDs for those belonging in that team. */
      players: (number)[];
      /** @description An array of the player IDs of those in the main roster */
      starters: (number)[];
      /** @description An array of the player IDs of the subs. */
      subs: (number)[];
    };
    foreignIds: {
      drupalId?: string;
    };
    highlanderPlayer: {
      /** @description The player ID */
      id: number;
      /** @description URL friendly version of the player's in game name */
      slug: string;
      /** @description The player's in game name */
      name: string;
      firstName: string;
      LastName?: string | null;
      /** @description The role they usually play */
      roleSlug: string;
      /** @description URL to the player's photo */
      photoUrl: string | null;
      hometown: string | null;
      region: string;
      /** Format: date-time */
      birthdate: string | null;
      /**
       * Format: date-time 
       * @description The date and time when this entry was created.
       */
      createdAt: string;
      /**
       * Format: date-time 
       * @description The date and time when this entry was last updated.
       */
      updatedAt: string;
      /**
       * @description Contains a description of the player translated to various languages.
       * 
       * The keys are presented in the format ([ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1)
       * and [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2))
       * 
       * `{languageCode}_{countryCode}`
       * 
       * The value is a string containing
       * html tags representing the description in that specific locale.
       */
      bios: {
        [key: string]: string | undefined;
      };
      foreignIds: components["schemas"]["foreignIds"] & ({
        [key: string]: string | undefined;
      });
      /**
       * @description Contains links to the player's social media accounts.
       * 
       * The key is the name of the social media platform and the value is the URL
       */
      socialNetworks: {
        [key: string]: string | undefined;
      };
      champions: ({
          id: number;
          /** @description The player ID */
          playerId: number;
          /** @description The champion ID */
          championId: number;
          /** @description The champion's name */
          championKey: string;
          /** @description The champion's name */
          championName: string;
          /**
           * Format: date-time 
           * @description The date and time when this entry was created.
           */
          createdAt: string;
          /**
           * Format: date-time 
           * @description The date and time when this entry was last updated.
           */
          updatedAt: string;
        })[];
    };
    /** @description An array containing the teams that have participated in this league. */
    highlanderTeams: (components["schemas"]["highlanderTeam"])[];
    highlanderPlayers: (components["schemas"]["highlanderPlayer"])[];
    baseScheduleItem: {
      /** @description The schedule item ID. */
      id: string;
      /**
       * Format: date-time 
       * @description The time the match/event is/was scheduled to start.
       */
      scheduledTime: string;
      tags: components["schemas"]["tags"];
      /** @description The tournament ID */
      tournament: string;
      /** @description The League ID */
      league: string;
    };
    matchScheduleItem: components["schemas"]["baseScheduleItem"] & {
      /** @description Contains the tournament and match Ids for the specific match. */
      content: string;
      /** @description The match ID */
      match: string;
      /** @description The bracket ID */
      bracket: string;
    };
    eventScheduleItem: components["schemas"]["baseScheduleItem"] & {
      content: string;
    };
    scheduleItem: components["schemas"]["matchScheduleItem"] | components["schemas"]["eventScheduleItem"];
    /**
     * @description The labels are used to describe the week and day the match/event is taking place in.
     * Also, it could indicate the stage of the tournament.
     * 
     * The blockPrefix comes before the block Label. Same with the subBlockPrefix and the subBlockLabel.
     */
    tags: {
      subBlockLabel: string;
      blockLabel: string;
      leagueLabel: string;
      blockPrefix?: string;
      subBlockPrefix: string;
      yearLabel?: string;
      /** @description Contains the tournament and bracket Ids the match/event belongs to. */
      stageLabel?: string;
      /** @description Contains the tournament ID. */
      tournamentLabel: string;
    };
  };
  responses: never;
  parameters: {
    hl: components["schemas"]["locale"];
    /** @description The id(s) of the league(s) you want details of */
    leagueIds: (string)[];
    /** @description The id of the league you want details of */
    leagueId: string;
    /** @description The id of the league you want details of */
    highlanderLeagueId: string;
    /**
     * @description Base 64 encoded string used to determine the
     * next "page" of data to pull
     */
    pageToken: string;
    /** @description The id(s) of the tournament(s) you want details ofs */
    tournamentIds: (string)[];
    /** @description The id of the match that you want */
    id: number;
    /**
     * @description The team slug(s).
     * 
     * You can input more than one slug.
     */
    teamSlugs: (string)[];
    /**
     * @description The game Id(s).
     * 
     * You can input more than one game Id(s).
     */
    gameIds: (number)[];
    /** @description The game id of the match */
    pathGameId: number;
    /** @description The date-time (RFC3339) */
    startingTime: string;
    /** @description The id of the league you want details of */
    league: string;
    /** @description The team slug. */
    teamSlug: string;
    /** @description The tournament ID. */
    highlanderTournamentId: string;
    /** @description The player slug. */
    playerSlug: string;
  };
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type external = Record<string, never>;

export interface operations {

  getLeagues: {
    parameters: {
      query: {
        hl: components["parameters"]["hl"];
      };
    };
    responses: {
      /** @description Successful request */
      200: {
        content: {
          "application/json": {
            data: {
              leagues: (components["schemas"]["extendedLeague"] & {
                  /**
                   * @description Indicates which type of tournament the league is. Whether
                   * international or a regional tournament. The region name is
                   * given.
                   */
                  region: string;
                })[];
            };
          };
        };
      };
    };
  };
  getSchedule: {
    parameters: {
      query: {
        hl: components["parameters"]["hl"];
        leagueId?: components["parameters"]["leagueIds"];
        pageToken?: components["parameters"]["pageToken"];
      };
    };
    responses: {
      /** @description Successful request */
      200: {
        content: {
          "application/json": {
            data: {
              schedule: {
                /**
                 * Format: date-time 
                 * @description The time the data presented was last updated
                 */
                updated: string;
                pages: {
                  older: components["schemas"]["pageToken"];
                  newer: components["schemas"]["pageToken"];
                };
                events: (components["schemas"]["extendedEvent"] & {
                    league: components["schemas"]["baseLeague"];
                    match: {
                      teams: ({
                          record: components["schemas"]["record"];
                          result: {
                            outcome: components["schemas"]["outcome"];
                          };
                        })[];
                    };
                  })[];
              };
            };
          };
        };
      };
    };
  };
  getLive: {
    parameters: {
      query: {
        hl: components["parameters"]["hl"];
      };
    };
    responses: {
      /** @description Successful request */
      200: {
        content: {
          "application/json": {
            data: {
              schedule: {
                /**
                 * @description Array of event objects representing matches that are
                 * currently ongoing.
                 * 
                 * This will be null if no match is taking place at that
                 * time
                 */
                events: ((components["schemas"]["extendedEvent"] & {
                    id: string;
                    league: components["schemas"]["extendedLeague"];
                    match?: {
                      teams: ({
                          slug: components["schemas"]["teamSlug"];
                          record: components["schemas"]["record"];
                          result: {
                            outcome: components["schemas"]["outcome"];
                          };
                        })[];
                    };
                  })[]) | null;
              };
            };
          };
        };
      };
    };
  };
  getTournamentsForLeague: {
    parameters: {
      query: {
        hl: components["parameters"]["hl"];
        leagueId?: components["parameters"]["leagueId"];
      };
    };
    responses: {
      /** @description Successful request */
      200: {
        content: {
          "application/json": {
            data: {
              /**
               * @description An array of league object(s) where each object contains an array of
               * tournaments.
               */
              leagues: ({
                  /**
                   * @description An array of tournament object(s) where each object describes a
                   * specific tournament.
                   */
                  tournaments: (components["schemas"]["tournament"])[];
                })[];
            };
          };
        };
      };
    };
  };
  getStandings: {
    parameters: {
      query: {
        hl: components["parameters"]["hl"];
        tournamentId?: components["parameters"]["tournamentIds"];
      };
    };
    responses: {
      /** @description Successful request */
      200: {
        content: {
          "application/json": {
            data: {
              /** @description Each object in the array contains details of each tournament requested. */
              standings: ({
                  stages: (components["schemas"]["stage"])[];
                })[];
            };
          };
        };
      };
    };
  };
  getStandingsV3: {
    parameters: {
      query: {
        hl: components["parameters"]["hl"];
        tournamentId?: components["parameters"]["tournamentIds"];
      };
    };
    responses: {
      /** @description Successful request */
      200: {
        content: {
          "application/json": {
            data: {
              /** @description Each object in the array contains details of each tournament requested. */
              standings: (components["schemas"]["standing"])[];
            };
          };
        };
      };
    };
  };
  getCompletedEvents: {
    parameters: {
      query: {
        hl: components["parameters"]["hl"];
        tournamentId?: components["parameters"]["tournamentIds"];
      };
    };
    responses: {
      /** @description Successful request */
      200: {
        content: {
          "application/json": {
            data: {
              schedule: {
                events: (components["schemas"]["simpleEvent"] & {
                    games: (components["schemas"]["game"])[];
                    match: {
                      /** @enum {string} */
                      type: "normal";
                    };
                  })[];
              };
            };
          };
        };
      };
    };
  };
  getEventDetails: {
    parameters: {
      query: {
        hl: components["parameters"]["hl"];
        id: components["parameters"]["id"];
      };
    };
    responses: {
      /** @description Succesful request */
      200: {
        content: {
          "application/json": {
            data: {
              event: components["schemas"]["baseEvent"] & ({
                id: string;
                type: components["schemas"]["eventType"];
                league: components["schemas"]["simpleLeague"];
                match: {
                  games: (components["schemas"]["extendedGame"])[];
                  strategy: components["schemas"]["baseStrategy"];
                  teams: ({
                      id: components["schemas"]["teamId"];
                      result: components["schemas"]["result"];
                    })[];
                };
                /**
                 * @description For a live match this will contain information about various streams,
                 * the platforms they are on and the locale.
                 * 
                 * Otherwise it will be null.
                 */
                streams: (components["schemas"]["extendedVod"])[] | null;
              });
            };
          };
        };
      };
    };
  };
  getTeams: {
    parameters: {
      query: {
        hl: components["parameters"]["hl"];
        id?: components["parameters"]["teamSlugs"];
      };
    };
    responses: {
      /** @description Successful request */
      200: {
        content: {
          "application/json": {
            data: {
              teams: (components["schemas"]["extendedTeam"])[];
            };
          };
        };
      };
    };
  };
  getGames: {
    parameters: {
      query: {
        hl: components["parameters"]["hl"];
        id?: components["parameters"]["gameIds"];
      };
    };
    responses: {
      /** @description Successful request */
      200: {
        content: {
          "application/json": {
            data: {
              games: (components["schemas"]["simpleGame"])[];
            };
          };
        };
      };
    };
  };
  getWindow: {
    parameters: {
      query: {
        startingTime?: components["parameters"]["startingTime"];
      };
      path: {
        gameId: components["parameters"]["pathGameId"];
      };
    };
    responses: {
      /** @description Successful request */
      200: {
        content: {
          "application/json": components["schemas"]["window"];
        };
      };
    };
  };
  getDetails: {
    parameters: {
      query: {
        startingTime?: components["parameters"]["startingTime"];
        /** @description A list of the participant Ids separated by underscores and not commas */
        participantIds?: string;
      };
      path: {
        gameId: components["parameters"]["pathGameId"];
      };
    };
    responses: {
      /** @description Successful request */
      200: {
        content: {
          "application/json": {
            frames: (components["schemas"]["detailsFrame"])[];
          };
        };
      };
    };
  };
  navItems: {
    responses: {
      /** @description Successful request */
      200: {
        content: {
          "application/json": {
            navItems: (components["schemas"]["navItem"])[];
            leagues: (components["schemas"]["highlanderLeague"])[];
          };
        };
      };
    };
  };
  /**
   * @description This endpoint returns details about esports vods on YouTube.
   * 
   * The data returned by this endpoint is fairly large (more than 5MB) since
   * it includes vods from 2015 up to (at the time of writing this) June 2019
   * and it will continue growing.
   * 
   * Do consider this when dealing with clients (like mobile phones) where
   * bandwidth and memory may be scarce.
   * 
   * It is highly advised that you cache the data from this endpoint.
   */
  videos: {
    responses: {
      /** @description Successful request */
      200: {
        content: {
          "application/json": {
            videos: (components["schemas"]["video"])[];
          };
        };
      };
    };
  };
  /** @description If a league does not have highlanderTournament objects, the API will return 404 */
  highlanderTournaments: {
    parameters: {
      query: {
        league: components["parameters"]["league"];
      };
    };
    responses: {
      /** @description Successful request */
      200: {
        content: {
          "application/json": components["schemas"]["highlanderTournaments"];
        };
      };
      /** @description Not Found */
      404: {
        content: {
          "application/json": {
            error: {
              /** @enum {integer} */
              statusCode: 404;
              message: string;
            };
          };
        };
      };
    };
  };
  leagues: {
    parameters: {
      query: {
        /**
         * @description 'This endpoint requires either the id or the slug to be passed. If both are present then only the first
         * one will be considered.
         * 
         * _Due to a limitation in the OpenApi specification it is not possible to show the mutual exclusive nature
         * that the query parameters in this endpoint require. The schema below is as close as a representation I
         * could get in expressing the nature of the query parameters._
         * 
         * Check the examples below to help better understand the query parameters needed.
         * 
         * **Example 1**
         * 
         * `https://api.lolesports.com/api/v1/leagues?id=3`
         * 
         * This will return the details for **LEC**.
         * 
         * **Example 2**
         * 
         * `https://api.lolesports.com/api/v1/leagues?slug=worlds`
         * 
         * This will return the details for **Worlds**
         * 
         * **Example 3**
         * 
         * `https://api.lolesports.com/api/v1/leagues?id=3&slug=worlds`
         * 
         * In such a scenario where both query parameters are used only the first will be considered, hence it will
         * only return the details for **LEC**.
         * 
         * **Example 4**
         * 
         * `https://api.lolesports.com/api/v1/leagues`
         * 
         * This is not valid. At least one of the two query parameters (id or slug) is required.'
         */
        query: OneOf<[{
          id: number;
        }, {
          slug: string;
        }]>;
      };
    };
    responses: {
      /** @description Successful request */
      200: {
        content: {
          "application/json": {
            /** @description This array contains information about the league retrieved. */
            leagues: (components["schemas"]["highlanderLeague"])[];
            highlanderTournaments?: components["schemas"]["highlanderTournaments"];
            highlanderRecords?: components["schemas"]["highlanderRecords"];
            teams?: components["schemas"]["highlanderTeams"];
            players?: components["schemas"]["highlanderPlayers"];
          };
        };
      };
      /** @description Not Found */
      404: {
        content: {
          "application/json": {
            /** @enum {string} */
            error?: "Invalid Input Error";
          };
        };
      };
    };
  };
  scheduleItems: {
    parameters: {
      query: {
        leagueId: components["parameters"]["highlanderLeagueId"];
      };
    };
    responses: {
      /** @description Successful request */
      200: {
        content: {
          "application/json": {
            scheduleItems?: (components["schemas"]["scheduleItem"])[];
            highlanderTournaments?: components["schemas"]["highlanderTournaments"];
            teams?: components["schemas"]["highlanderTeams"];
            highlanderRecords?: components["schemas"]["highlanderRecords"];
            players?: components["schemas"]["highlanderPlayers"];
          };
        };
      };
    };
  };
  /**
   * @description If the `teamStatsSummaries`, `teamRosterStats` and `teamStatsHistories` keys are not present,
   * then the team did not take part in that particular tournament.
   */
  teams: {
    parameters: {
      query: {
        slug: components["parameters"]["teamSlug"];
        tournament: components["parameters"]["highlanderTournamentId"];
      };
    };
    responses: {
      /** @description Successful request */
      200: {
        content: {
          "application/json": {
            /** @description Contains the players currently in the team. */
            players: (components["schemas"]["highlanderPlayer"] & {
                teamRosterStat?: string;
              })[];
            highlanderTournaments: components["schemas"]["highlanderTournaments"];
            /** @description Contains details about a few of the team's upcoming matches */
            scheduleItems: (components["schemas"]["scheduleItem"])[];
            /** @description Contains a summary of the team stats during that particular tournament. */
            teamStatsSummaries?: ({
                /** @description Contains the team ID */
                teamId: string;
                /**
                 * Format: double 
                 * @description The team's KDA Ratio
                 */
                kdaRatio: number;
                /**
                 * Format: int32 
                 * @description The position the team ranks at compared to other teams' KDA ratio
                 */
                kdaRatioRank: number;
                /**
                 * Format: int32 
                 * @description The average length of the team's wins in seconds.
                 */
                averageWinLength: number;
                /**
                 * Format: int32 
                 * @description The position the team ranks at compared to other team's average win lengths.
                 */
                averageWinLengthRank: number;
                /**
                 * Format: double 
                 * @description The ratio of first dragons killed by this team compared to the total first dragons killed
                 * in this team's matches.
                 */
                firstDragonKillRatio: number;
                /**
                 * Format: int32 
                 * @description The position the teams ranks at compared to other team's first dragon kill ratio
                 */
                firstDragonKillRatioRank: number;
                /**
                 * Format: double 
                 * @description The ratio of first tower secured by this team compared to the total first towers secured
                 * in this team's matches.
                 */
                firstTowerRatio: number;
                /**
                 * Format: int32 
                 * @description The position the teams ranks at compared to other team's first tower ratio.
                 */
                firstTowerRatioRank: number;
                /** @description It is assumed that the values represent the damage dealt in thousands. */
                averageDamageByPosition: {
                  /** Format: int32 */
                  DUO_CARRY?: number;
                  /** Format: int32 */
                  DUO_SUPPORT?: number;
                  /** Format: int32 */
                  SOLO?: number;
                  /** Format: int32 */
                  NONE?: number;
                  /** Format: int32 */
                  DUO?: number;
                };
              })[];
            /** @description Contains stats of the players of the particular team who played in that tournament. */
            teamRosterStats?: ({
                playerId: string;
                /** Format: int32 */
                gamesPlayed: number;
                /** Format: int32 */
                averageAssists: number;
                /** Format: double */
                averageDeaths: number;
                /** Format: double */
                averageKillParticipation: number;
                /** Format: double */
                averageKills: number;
                summonerName: string;
                championIds: (number)[];
              })[];
            /** @description A contains stats of the team's previous 4 matches in that particular tournament. */
            teamStatsHistories?: ({
                /** @description Contains the game ID and the team ID. */
                id: string;
                /**
                 * Format: int64 
                 * @description Unix timestamp in milliseconds of when the match started.
                 */
                timestamp: number;
                /** Format: int32 */
                assists: number;
                /** Format: int32 */
                kills: number;
                /** @enum {boolean} */
                win: true | false;
                championIds?: (number)[];
                /** @description The match ID */
                match: string;
                /**
                 * Format: int32 
                 * @description The team ID
                 */
                team: number;
                /**
                 * Format: int32 
                 * @description The opponent's team ID
                 */
                opponent: number;
                /**
                 * Format: int32 
                 * @description The game ID
                 */
                game: number;
              })[];
            teams: components["schemas"]["highlanderTeams"];
          };
        };
      };
    };
  };
  /**
   * @description If the `playerStatsSummaries` and `playerStatsHistories` keys are not present,
   * then the player did not take part in that particular tournament.
   */
  players: {
    parameters: {
      query: {
        slug: components["parameters"]["playerSlug"];
        tournament: components["parameters"]["highlanderTournamentId"];
      };
    };
    responses: {
      /** @description Successful request */
      200: {
        content: {
          "application/json": {
            /**
             * @description Contains information about the player in question.
             * 
             * If `playerStatsSummary` and `playerStatsHistory` are missing then the player did not take part
             * in the tournament specificed by the tournament ID in the url.
             */
            players: (components["schemas"]["highlanderPlayer"] & {
                /**
                 * @description The IDs of the team(s) this player is/has been on the starting
                 * lineup
                 */
                starterOnTeams: (number)[];
                /** @description The IDs of the team(s) this player is/has been on as a sub player */
                subOnTeams: (number)[];
                /** @description A combination of the teamIDs in `starterOnTeams` and `subOnTeams` */
                teams: (number)[];
                photoInformation: {
                  /** @description The width of the image in pixels. */
                  width: number;
                  /** @description The height of the image in pixels. */
                  height: number;
                  /** @description The image's file format. */
                  type: string;
                  /** @description URL to the player's photo. */
                  url: string;
                  transferred: number;
                  /** @description Size of the image in bytes */
                  size: number;
                  time: Record<string, never>;
                };
                /**
                 * @description Contains the ids to schedule items representing the player's/team's next matches.
                 * 
                 * This is regardless of the tournament ID passed in the url.
                 */
                scheduleItems: (string)[];
                playerStatsSummary?: string;
                /**
                 * @description Contains the `playerStatsHistory` IDs, which are just the game ID of the match and the player
                 * ID separated by a colon.
                 * 
                 * Contains the last 4 played matches in the specified tournament. The first ID is of the most
                 * recently played match.
                 */
                playerStatsHistory?: (string)[];
              })[];
            /** @description Contains the various tournaments the player has participated in. */
            highlanderTournaments: (components["schemas"]["highlanderTournament"])[];
            /** @description Contains details about the next 4 matches the player's team is schedule to participate in. */
            scheduleItems: (components["schemas"]["matchScheduleItem"])[];
            teams: (components["schemas"]["highlanderTeam"])[];
            /** @description The stats displayed here are for the player during the tournament specified in the url */
            playerStatsSummaries?: ({
                playerId: string;
                /** Format: double */
                kdaRatio: number;
                /** Format: integer */
                kdaRatioRank: number;
                /** Format: double */
                csPerTenMinutes: number;
                /** Format: integer */
                csPerTenMinutesRank: number;
                /** Format: double */
                killParticipation: number;
                killParticipationRank: number;
                mostplayedchampions: ({
                    /** Format: integer */
                    championId: number;
                    /** Format: integer */
                    wins: number;
                    /** Format: integer */
                    losses: number;
                    /** Format: integer */
                    total: number;
                    /** Format: double */
                    kdaRatio: number;
                  })[];
              })[];
            /**
             * @description Displays stats from the recently played matches in that particular tournaments.
             * The array starts with the most recently played match.
             */
            playerStatsHistories?: ({
                id: string;
                playerId: string;
                /** Format: integer */
                championId: number;
                /**
                 * Format: int64 
                 * @description Unix timestamp in milliseconds of when the match started.
                 */
                timestamp: number;
                /** Format: integer */
                assists: number;
                /** Format: integer */
                deaths: number;
                /** Format: integer */
                kills: number;
                /** Format: double */
                csPerTenMinutes: number;
                /** Format: double */
                kdaRatio: number;
                /** Format: double */
                killParticipation: number;
                /** @enum {boolean} */
                win: true | false;
                /**
                 * Format: ^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$ 
                 * @description The match ID
                 */
                match: string;
                /**
                 * Format: integer 
                 * @description The team ID the player playes for.
                 */
                team: number;
                /**
                 * Format: integer 
                 * @description The opponent's team ID.
                 */
                opponent: number;
                /**
                 * Format: ^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$ 
                 * @description The game ID
                 */
                game: string;
              })[];
          };
        };
      };
    };
  };
}

export type OperationIds = keyof operations

type HttpMethods = "get" | "post" | "put" | "patch" | "delete" | "options" | "head";

type OmitNeverFromRecord<T extends Record<string, unknown>> = Pick<
  T,
  {
    [K in keyof T]: T[K] extends never ? never : K;
  }[keyof T]
>;

type FilterPathsByMethod<Method extends HttpMethods> = {
  [P in keyof paths]: Method extends keyof paths[P] ? P : never;
}[keyof paths];

export const createBaseFetcher = (
  ownFetcher: (
    path: string,
    param: {
      method: HttpMethods;
      body?: Record<string, unknown>;
    },
  ) => Promise<unknown>,
) => {
  return new Proxy(
    {},
    {
      get:
        (_, method: HttpMethods) =>
        (path: keyof paths, params: { path: string; query: string; body: Record<string, unknown> }) =>
          ownFetcher(path + (params.query ? `?${new URLSearchParams(params.query)}` : ""), {
            method,
            body: params.body,
          }),
    },
  ) as {
    [Method in HttpMethods]: <Path extends FilterPathsByMethod<Method>>(
      path: Path,
      opts: OmitNeverFromRecord<{
        path: Get<paths[Path], [Method, "parameters", "path"]>;
        query: Get<paths[Path], [Method, "parameters", "query"]>;
        body: Get<paths[Path], [Method, "requestBody", "content", "application/json"]>;
      }>,
    ) => Promise<Get<paths[Path], [Method, "responses", 200, "content", "application/json"]>>;
  };
};

export const createOperationIdFetcher = (
  ownFetcher: (
    path: string,
    param: {
      method: HttpMethods;
      body?: Record<string, unknown>;
    },
  ) => Promise<unknown>,
) => {
  const baseFetcher = createBaseFetcher(ownFetcher);
  const f =
    <Path extends keyof paths, Method extends HttpMethods>(p: Path, m: Method) =>
    (
      ...o: keyof OmitNeverFromRecord<{
        query: Get<paths[Path], [Method, "parameters", "query"]>;
        body: Get<paths[Path], [Method, "requestBody", "content", "application/json"]>;
      }> extends never
        ? []
        : [
            OmitNeverFromRecord<{
              query: Get<paths[Path], [Method, "parameters", "query"]>;
              body: Get<paths[Path], [Method, "requestBody", "content", "application/json"]>;
            }>,
          ]
    ): Promise<Get<paths[Path], [Method, "responses", 200, "content", "application/json"]>> =>
      baseFetcher[m](p as any, o[0] as any);

  return {
    getLeagues: f("/getLeagues", "get"),
    getSchedule: f("/getSchedule", "get"),
    getLive: f("/getLive", "get"),
    getTournamentsForLeague: f("/getTournamentsForLeague", "get"),
    getStandings: f("/getStandings", "get"),
    getStandingsV3: f("/getStandingsV3", "get"),
    getCompletedEvents: f("/getCompletedEvents", "get"),
    getEventDetails: f("/getEventDetails", "get"),
    getTeams: f("/getTeams", "get"),
    getGames: f("/getGames", "get"),
    getWindow: f("/window/{gameId}", "get"),
    getDetails: f("/details/{gameId}", "get"),
    navItems: f("/navItems", "get"),
    videos: f("/videos", "get"),
    highlanderTournaments: f("/highlanderTournaments", "get"),
    leagues: f("/leagues", "get"),
    scheduleItems: f("/scheduleItems", "get"),
    teams: f("/teams", "get"),
    players: f("/players", "get")
  };
};