"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteAccount } from "@/app/dashboard/actions";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export function DeleteAccountDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteAccount();

      if (result.success) {
        toast.success("Account deleted successfully");
        // Redirect to auth page after successful deletion
        router.push("/auth");
      } else {
        toast.error(result.error || "Failed to delete account");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Delete account error:", error);
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          className="w-full"
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account
            and remove all your data from our servers, including:
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Your profile information</li>
            <li>• Your profile image</li>
            <li>• All your sessions and login history</li>
            <li>• All associated account data</li>
          </ul>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
