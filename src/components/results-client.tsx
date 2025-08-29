"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { 
  BarChart3, 
  Vote, 
  Users, 
  TrendingUp,
  LogOut,
  ArrowLeft
} from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  party: string;
  symbol?: string;
  voteCount: number;
}

interface ConstituencyResult {
  id: string;
  name: string;
  state: string;
  totalVoters: number;
  candidates: Candidate[];
}

interface ResultsClientProps {
  results: {
    success?: boolean;
    error?: string;
    data?: ConstituencyResult[];
  };
}

export default function ResultsClient({ results }: ResultsClientProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/auth");
  };

  const handleBackToEVM = () => {
    router.push("/dashboard");
  };

  if (results.error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-500">Error Loading Results</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">{results.error}</p>
            <div className="space-y-2">
              <Button onClick={handleBackToEVM} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to EVM
              </Button>
              <Button onClick={handleSignOut} variant="outline" className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const constituencies = results.data || [];

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Election Results</h1>
              <p className="text-muted-foreground">Live voting statistics and results</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleBackToEVM} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to EVM
            </Button>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Constituencies</p>
                  <p className="text-2xl font-bold">{constituencies.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-green-500/10 p-2 rounded-lg">
                  <Vote className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Votes Cast</p>
                  <p className="text-2xl font-bold">
                    {constituencies.reduce((sum, c) => sum + c.totalVoters, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-500/10 p-2 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Candidates</p>
                  <p className="text-2xl font-bold">
                    {constituencies.reduce((sum, c) => sum + c.candidates.length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Constituency Results */}
      <div className="max-w-6xl mx-auto space-y-6">
        {constituencies.map((constituency) => {
          const totalVotes = constituency.candidates.reduce((sum, c) => sum + c.voteCount, 0);
          const winningCandidate = constituency.candidates.reduce((winner, candidate) => 
            candidate.voteCount > winner.voteCount ? candidate : winner
          );

          return (
            <Card key={constituency.id} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{constituency.name}, {constituency.state}</span>
                  <span className="text-sm text-muted-foreground">
                    {totalVotes} votes cast
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {constituency.candidates.map((candidate) => {
                    const percentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;
                    const isWinner = candidate.id === winningCandidate.id;

                    return (
                      <div
                        key={candidate.id}
                        className={`p-4 rounded-lg border-2 ${
                          isWinner 
                            ? "border-green-500 bg-green-50 dark:bg-green-950/20" 
                            : "border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{candidate.name}</h3>
                              {isWinner && (
                                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                  LEADING
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{candidate.voteCount}</p>
                            <p className="text-sm text-muted-foreground">
                              {percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">{candidate.party}</p>
                          {candidate.symbol && (
                            <span className="text-sm font-medium">{candidate.symbol}</span>
                          )}
                        </div>

                        {/* Progress bar */}
                        <div className="mt-3 bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isWinner ? "bg-green-500" : "bg-primary"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
