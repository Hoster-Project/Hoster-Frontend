"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, UserPlus, MoreVertical, Eye, MessageSquare, Ban, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { getCategoryBadgeClass } from "@/lib/category-badge";

interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl?: string | null;
  role: string;
  listingCount: number;
  reservationCount: number;
  connectedChannels: number;
  blocked: boolean;
  createdAt: string;
  subscriptionPlan: string;
  accountStatus?: string;
  emailVerified?: boolean;
  invitationSentAt?: string | null;
}

const roles = ["All", "Host", "Provider"];

function getUserDisplayName(user: AdminUser): string {
  const parts = [user.firstName, user.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : user.email;
}

function getUserInitials(user: AdminUser): string {
  if (user.firstName || user.lastName) {
    return [user.firstName?.[0], user.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase();
  }
  return user.email[0].toUpperCase();
}

function getRoleBadgeClass(role: string) {
  return getCategoryBadgeClass(role, "role");
}

function getPlanBadgeClass(plan: string) {
  return getCategoryBadgeClass(plan, "plan");
}

function getStatusBadgeClass(status?: string) {
  return getCategoryBadgeClass(status, "status");
}

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showAddUser, setShowAddUser] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<{ id: string; name: string } | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    firstName: "", lastName: "", email: "",
    role: "host", phone: "", country: "", companyName: "", subscriptionPlan: "light",
  });
  const { toast } = useToast();
  const router = useRouter();

  const queryParams = new URLSearchParams();
  if (search) queryParams.set("search", search);
  if (roleFilter !== "All") queryParams.set("role", roleFilter.toLowerCase());
  const queryString = queryParams.toString();

  const { data: users, isLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users", queryString],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users${queryString ? `?${queryString}` : ""}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  const { data: authData } = useQuery<{ isAdmin: boolean; isModerator: boolean }>({
    queryKey: ["/api/admin/auth-check"],
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: typeof newUser) => {
      const res = await apiRequest("POST", "/api/admin/users", data);
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowAddUser(false);
      setNewUser({ firstName: "", lastName: "", email: "", role: "host", phone: "", country: "", companyName: "", subscriptionPlan: "light" });

      if (data?.inviteSent) {
        toast({ title: "User created", description: "Password creation email sent." });
      } else if (data?.inviteUrl) {
        setInviteLink(data.inviteUrl);
        toast({ title: "User created", description: "SMTP not configured. Copy the invite link." });
      } else {
        toast({ title: "User created", description: "Invite email could not be sent." });
      }
    },
    onError: (error: any) => {
      const msg = error?.message || "An unknown error occurred";
      toast({ title: "Failed to create user", description: msg, variant: "destructive" });
    },
  });

  const resendInviteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/resend-invitation`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Invitation resent" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to resend invitation", description: error?.message || "", variant: "destructive" });
    },
  });

  const blockUserMutation = useMutation({
    mutationFn: async ({ userId, blocked }: { userId: string; blocked: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}/block`, { blocked });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User status updated" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update user", description: error?.message || "", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setDeleteCandidate(null);
      toast({ title: "User deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Delete failed", description: error?.message || "", variant: "destructive" });
    },
  });

  return (
    <div className="portal-page space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="portal-title" data-testid="text-users-title">Users</h2>
        <Button onClick={() => setShowAddUser(true)} data-testid="button-add-user">
          <UserPlus className="h-4 w-4 mr-1.5" />
          Add User
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-users"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {roles.map((role) => (
            <Button
              key={role}
              variant={roleFilter === role ? "default" : "ghost"}
              size="sm"
              onClick={() => setRoleFilter(role)}
              data-testid={`button-filter-${role.toLowerCase()}`}
            >
              {role}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))
        ) : users && users.length > 0 ? (
          users.map((user) => {
            const displayName = getUserDisplayName(user);
            const initials = getUserInitials(user);
            const effectiveStatus = user.blocked
              ? "BLOCKED"
              : user.accountStatus || null;

            return (
              <Card key={user.id} data-testid={`card-user-${user.id}`}>
                <div className="flex items-center gap-3 p-4" data-testid={`row-user-${user.id}`}>
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={user.profileImageUrl || undefined} alt={displayName} />
                    <AvatarFallback className="text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium truncate" data-testid={`text-user-name-${user.id}`}>
                        {displayName}
                      </p>
                      <Badge className={getRoleBadgeClass(user.role)} data-testid={`badge-role-${user.id}`}>
                        {user.role}
                      </Badge>
                      <Badge className={getPlanBadgeClass(user.subscriptionPlan)} data-testid={`badge-plan-${user.id}`}>
                        {user.subscriptionPlan}
                      </Badge>
                      {effectiveStatus && (
                        <Badge
                          className={getStatusBadgeClass(effectiveStatus)}
                          data-testid={`badge-status-${user.id}`}
                        >
                          {effectiveStatus === "BLOCKED" ? "Blocked" : effectiveStatus}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground">
                        {user.listingCount} units
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.reservationCount} bookings
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" aria-label="User actions" variant="ghost" data-testid={`button-user-menu-${user.id}`}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                          data-testid={`button-more-info-${user.id}`}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          More Information
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/chat?tab=support&userId=${encodeURIComponent(user.id)}`)}
                          data-testid={`button-chat-user-${user.id}`}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Chat
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => blockUserMutation.mutate({ userId: user.id, blocked: !user.blocked })}
                          disabled={blockUserMutation.isPending}
                          data-testid={`button-toggle-block-${user.id}`}
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          {user.blocked ? "Unblock User" : "Block User"}
                        </DropdownMenuItem>
                        {["PENDING", "PASSWORD_SET"].includes(user.accountStatus || "") && (
                          <DropdownMenuItem
                            onClick={() => resendInviteMutation.mutate(user.id)}
                            data-testid={`button-resend-invite-${user.id}`}
                          >
                            Resend Invitation
                          </DropdownMenuItem>
                        )}
                        {authData?.isAdmin && (
                          <DropdownMenuItem
                            onClick={() => setDeleteCandidate({ id: user.id, name: displayName })}
                            disabled={deleteUserMutation.isPending}
                            className="text-destructive focus:text-destructive"
                            data-testid={`button-delete-user-${user.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12 text-muted-foreground" data-testid="text-no-users">
            No users found
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteCandidate} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
              {deleteCandidate ? ` This will permanently delete ${deleteCandidate.name}.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUserMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                if (!deleteCandidate) return;
                deleteUserMutation.mutate(deleteCandidate.id);
              }}
              disabled={deleteUserMutation.isPending}
              data-testid="button-confirm-delete-user"
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>First Name</Label>
                <Input
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  data-testid="input-new-user-first-name"
                />
              </div>
              <div className="space-y-1">
                <Label>Last Name</Label>
                <Input
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  data-testid="input-new-user-last-name"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                data-testid="input-new-user-email"
              />
            </div>
            <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
              A password creation email will be sent to this user. The link expires in 1 hour.
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Role</Label>
                <Select value={newUser.role} onValueChange={(val) => setNewUser({ ...newUser, role: val })}>
                  <SelectTrigger data-testid="select-new-user-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="host">Host</SelectItem>
                    <SelectItem value="provider">Provider</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Plan</Label>
                <Select value={newUser.subscriptionPlan} onValueChange={(val) => setNewUser({ ...newUser, subscriptionPlan: val })}>
                  <SelectTrigger data-testid="select-new-user-plan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="growth">Growth</SelectItem>
                    <SelectItem value="expanding">Expanding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Phone (optional)</Label>
              <Input
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                data-testid="input-new-user-phone"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowAddUser(false)} data-testid="button-cancel-add-user">
              Cancel
            </Button>
            <Button
              onClick={() => createUserMutation.mutate(newUser)}
              disabled={createUserMutation.isPending || !newUser.firstName || !newUser.lastName || !newUser.email}
              data-testid="button-save-new-user"
            >
              {createUserMutation.isPending ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!inviteLink} onOpenChange={(open) => (!open ? setInviteLink(null) : null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Invite Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              SMTP is not configured, so the invite email could not be sent. Copy this link and send it to the user (expires in 1 hour).
            </p>
            <Input value={inviteLink ?? ""} readOnly data-testid="input-invite-link" />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setInviteLink(null)} data-testid="button-close-invite-link">
              Close
            </Button>
            <Button
              onClick={async () => {
                if (!inviteLink) return;
                await navigator.clipboard.writeText(inviteLink);
                toast({ title: "Copied invite link" });
              }}
              data-testid="button-copy-invite-link"
            >
              Copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
