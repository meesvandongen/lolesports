import { api } from "@/api/api";
import { getRegionsWithLeagues } from "@/regions-with-leagues";
import { notFound, redirect } from "next/navigation";

export default async function RegionPage({
  params: { regionTag },
}: {
  params: {
    regionTag: string;
  };
}) {
  const { data } = await api.get("/getLeagues", {
    query: {
      hl: "en-US",
    },
  });

  const regions = getRegionsWithLeagues(data.leagues);

  const region = regions.find((region) => region.tag === regionTag);

  if (!region) {
    notFound();
  }

  redirect(`/${regionTag}/${region.leagues[0].id}`);
}
