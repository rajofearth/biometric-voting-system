import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getElectionResults } from "@/app/voting/action";
import ResultsClient from "@/components/results-client";

export default async function ResultsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session) {
    redirect("/auth");
  }

  // Get election results
  const results = await getElectionResults();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <ResultsClient results={results} />
    </div>
  );
}
