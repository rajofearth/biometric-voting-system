"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { castVote } from "@/app/voting/action";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { 
  Vote, 
  CheckCircle, 
  XCircle, 
  User, 
  Building2, 
  Shield,
  LogOut,
  BarChart3
} from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  party: string;
  symbol?: string;
  photo?: string;
}

interface Constituency {
  id: string;
  name: string;
  state: string;
  candidates: Candidate[];
}

interface VotingData {
  constituency: Constituency;
  hasVoted: boolean;
  voteToken?: string;
}

interface EVMClientProps {
  votingData: {
    success?: boolean;
    error?: string;
    data?: VotingData;
  };
}

export default function EVMClient({ votingData }: EVMClientProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [votingComplete, setVotingComplete] = useState(false);
  const router = useRouter();

  // Handle sign out
  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/auth");
  };

  // Handle vote casting
  const handleCastVote = async () => {
    if (!selectedCandidate) {
      toast.error("Please select a candidate");
      return;
    }

    setLoading(true);
    try {
      const result = await castVote({ candidateId: selectedCandidate });
      
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        setVotingComplete(true);
        toast.success("Vote cast successfully!");
      }
    } catch (error) {
      console.error("Error casting vote:", error);
      toast.error("Failed to cast vote");
    } finally {
      setLoading(false);
    }
  };



  // Show error if voting data failed to load
  if (votingData.error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <CardTitle className="text-xl text-red-500">Voting Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">{votingData.error}</p>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show voting complete screen
  if (votingComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <CardTitle className="text-xl text-green-500">Vote Cast Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-muted-foreground mb-6">
                Your vote has been recorded securely and is being counted. 
                Thank you for participating in the democratic process.
              </p>
              
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 mb-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-100">Vote Privacy Assured</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your vote is completely anonymous and secure.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={handleSignOut} 
                  className="w-full"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  End Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show already voted screen
  if (votingData.data?.hasVoted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <CardTitle className="text-xl">Already Voted</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              You have already cast your vote in this election.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => router.push("/admin/results")} 
                className="w-full"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                View Results
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

  // Show main EVM interface
  const constituency = votingData.data?.constituency;
  const candidates = constituency?.candidates || [];

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Vote className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Electronic Voting Machine</h1>
              <p className="text-muted-foreground">Secure Biometric Voting System</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => router.push("/admin/results")} 
              variant="outline"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              View Results
            </Button>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Constituency Info */}
      {constituency && (
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Constituency Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Constituency</p>
                  <p className="font-semibold">{constituency.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">State</p>
                  <p className="font-semibold">{constituency.state}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Candidates */}
      <div className="max-w-4xl mx-auto">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Select Your Candidate</span>
            </CardTitle>
            <p className="text-muted-foreground">
              Click on a candidate to select them, then press the "Cast Vote" button
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedCandidate === candidate.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedCandidate(candidate.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      {candidate.photo ? (
                        <img 
                          src={candidate.photo} 
                          alt={candidate.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{candidate.name}</h3>
                      <p className="text-sm text-muted-foreground">{candidate.party}</p>
                    </div>
                    {selectedCandidate === candidate.id && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Cast Vote Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleCastVote}
                disabled={!selectedCandidate || loading}
                size="lg"
                className="px-8 py-3"
              >
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                    <Vote className="mr-2 h-5 w-5" />
                    Cast Vote
                  </>
                )}
              </Button>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">Vote Privacy</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Your vote is completely anonymous and secure. No one can trace who you voted for. 
                    Your vote will be counted in the final results.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
