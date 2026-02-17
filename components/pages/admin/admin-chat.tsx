"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ChevronLeft, Headphones, MessageSquare, Send } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatAutoScroll } from "@/hooks/use-chat-auto-scroll";

interface SupportThread {
  threadId: string;
  userId: string;
  userName: string;
  userEmail: string | null;
  status: "OPEN" | "CLOSED";
  assignedToUserId: string | null;
  assignedToName: string | null;
  assignedToRole: string | null;
  requestedAt: string | null;
  acceptedAt: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  messageCount: number;
}

interface ChatMessage {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  body: string;
  sentAt: string | null;
}

function getInitials(name: string): string {
  return (
    name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

export default function AdminChat() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [selectedSupportUserId, setSelectedSupportUserId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");

  const { data: supportThreads, isLoading: supportLoading } = useQuery<SupportThread[]>({
    queryKey: ["/api/admin/support-threads"],
  });

  const { data: supportMessages, isLoading: supportMsgLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/admin/support-threads", selectedSupportUserId, "messages"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/support-threads/${selectedSupportUserId}/messages`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!selectedSupportUserId,
  });

  const { data: selectedSupportPreview } = useQuery<{
    userId: string;
    userName: string;
    userEmail: string | null;
    assignedToUserId: string | null;
    assignedToName: string | null;
  }>({
    queryKey: ["/api/admin/support-threads", selectedSupportUserId, "preview"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/support-threads/${selectedSupportUserId}/preview`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load user");
      return res.json();
    },
    enabled: !!selectedSupportUserId,
  });

  useEffect(() => {
    const userId = searchParams.get("userId");
    if (userId) setSelectedSupportUserId(userId);
  }, [searchParams]);

  const { containerRef, endRef } = useChatAutoScroll(supportMessages);

  const sendSupportMutation = useMutation({
    mutationFn: async ({ userId, body }: { userId: string; body: string }) => {
      const res = await apiRequest("POST", `/api/admin/support-threads/${userId}/send`, { body });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-threads", selectedSupportUserId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-threads"] });
      setMessageText("");
    },
  });

  const acceptSupportMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("POST", `/api/admin/support-threads/${userId}/accept`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-threads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-threads", selectedSupportUserId, "preview"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-threads", selectedSupportUserId, "messages"] });
    },
  });

  const handleSend = () => {
    if (!selectedSupportUserId || !messageText.trim()) return;
    sendSupportMutation.mutate({ userId: selectedSupportUserId, body: messageText.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedSupportThread = supportThreads?.find((t) => t.userId === selectedSupportUserId);
  const selectedAssignedToUserId = selectedSupportThread?.assignedToUserId ?? selectedSupportPreview?.assignedToUserId ?? null;
  const canReply = !!selectedSupportUserId && !!user?.id && selectedAssignedToUserId === user.id;
  const needsAccept = !!selectedSupportUserId && !selectedAssignedToUserId;
  const hasSelection = !!selectedSupportUserId;
  const totalSupportUnread = supportThreads?.reduce((sum, t) => sum + t.unreadCount, 0) ?? 0;

  return (
    <div className="flex h-full min-h-0">
      <div className={`border-r flex-col flex-shrink-0 w-full md:w-80 ${hasSelection ? "hidden md:flex" : "flex"}`}>
        <div className="p-3 border-b">
          <Button size="sm" variant="default" className="w-full justify-start relative" data-testid="tab-support">
            <Headphones className="h-3.5 w-3.5 mr-1.5" />
            Support
            {totalSupportUnread > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">
                {totalSupportUnread}
              </Badge>
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          {supportLoading ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-md" />
              ))}
            </div>
          ) : supportThreads && supportThreads.length > 0 ? (
            supportThreads.map((thread) => {
              const initials = getInitials(thread.userName);
              const isSelected = selectedSupportUserId === thread.userId;

              return (
                <div
                  key={thread.userId}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b ${isSelected ? "bg-sidebar-accent" : ""}`}
                  onClick={() => setSelectedSupportUserId(thread.userId)}
                  data-testid={`support-thread-${thread.userId}`}
                >
                  <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">{thread.userName}</p>
                      {thread.unreadCount > 0 && (
                        <Badge variant="default" className="text-[10px] px-1.5">
                          {thread.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{thread.userEmail || "Support chat"}</p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {thread.assignedToUserId
                        ? `Assigned: ${thread.assignedToName || "Support agent"}`
                        : "Unassigned"}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Headphones className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No support conversations</p>
            </div>
          )}
        </div>
      </div>

      <div className={`flex-1 flex-col min-w-0 ${hasSelection ? "flex" : "hidden md:flex"}`}>
        {hasSelection ? (
          <>
            <div className="p-4 border-b flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden -ml-2 mr-1 h-8 w-8"
                onClick={() => setSelectedSupportUserId(null)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="text-xs font-semibold">
                  {selectedSupportThread ? getInitials(selectedSupportThread.userName) : "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold" data-testid="text-chat-user-name">
                  {selectedSupportThread?.userName || selectedSupportPreview?.userName || "User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedSupportThread?.userEmail || selectedSupportPreview?.userEmail || "Support chat"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {selectedAssignedToUserId
                    ? `Assigned: ${selectedSupportThread?.assignedToName || selectedSupportPreview?.assignedToName || "Support agent"}`
                    : "Unassigned support request"}
                </p>
              </div>
              {needsAccept && (
                <Button
                  size="sm"
                  className="ml-auto"
                  onClick={() => selectedSupportUserId && acceptSupportMutation.mutate(selectedSupportUserId)}
                  disabled={acceptSupportMutation.isPending}
                  data-testid="button-accept-support-thread"
                >
                  Accept
                </Button>
              )}
            </div>

            <div ref={containerRef} className="flex-1 overflow-auto p-4 space-y-3 chat-scroll">
              {supportMsgLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-2/3 rounded-md" />
                  ))}
                </div>
              ) : supportMessages && supportMessages.length > 0 ? (
                supportMessages.map((msg) => {
                  const isOutbound = msg.direction === "OUTBOUND";
                  return (
                    <div key={msg.id} className={`flex ${isOutbound ? "justify-end" : "justify-start"}`} data-testid={`message-${msg.id}`}>
                      <Card className={`max-w-[70%] p-3 ${isOutbound ? "bg-primary text-primary-foreground" : ""}`}>
                        <p className="text-sm">{msg.body}</p>
                        {msg.sentAt && (
                          <p className={`text-[10px] mt-1 ${isOutbound ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {format(new Date(msg.sentAt), "MMM d, h:mm a")}
                          </p>
                        )}
                      </Card>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center h-full" data-testid="text-no-messages">
                  <p className="text-sm text-muted-foreground">No messages yet</p>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="chat-composer">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  data-testid="input-chat-message"
                />
                <Button
                  size="icon"
                  aria-label="Send message"
                  onClick={handleSend}
                  disabled={!messageText.trim() || sendSupportMutation.isPending || !canReply}
                  data-testid="button-send-message"
                >
                  <Send />
                </Button>
              </div>
              {needsAccept && (
                <p className="text-xs text-muted-foreground mt-2">
                  Accept this support request first to reply.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center" data-testid="text-select-conversation">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Select a support thread to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
