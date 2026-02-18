"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Send } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useChatAutoScroll } from "@/hooks/use-chat-auto-scroll";

type SourceType = "cleaning" | "marketplace";

type CleaningMessage = {
  id: string;
  senderId: string;
  senderType: "HOST" | "PROVIDER";
  body: string;
  sentAt: string;
};

type MarketplaceMessage = {
  id: string;
  senderId: string;
  senderName?: string;
  messageText: string;
  sentAt: string;
};

export default function ProviderChatPage({ threadId }: { threadId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [body, setBody] = useState("");
  const source = (searchParams.get("source") || "cleaning") as SourceType;
  const { user } = useAuth();

  const messagesQuery = useQuery<CleaningMessage[] | MarketplaceMessage[]>({
    queryKey: ["/api/provider-thread", source, threadId],
    queryFn: async () => {
      const url =
        source === "marketplace"
          ? `/api/provider-chats/${threadId}/messages`
          : `/api/cleaning/messages/${threadId}`;
      const res = await fetch(url, { credentials: "include", cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load messages");
      return res.json();
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      const url =
        source === "marketplace"
          ? `/api/provider-chats/${threadId}/messages`
          : `/api/cleaning/messages/${threadId}`;
      const res = await apiRequest("POST", url, { body: text });
      return res.json();
    },
    onMutate: async (text: string) => {
      const queryKey = ["/api/provider-thread", source, threadId] as const;
      await queryClient.cancelQueries({ queryKey });
      const previousMessages =
        queryClient.getQueryData<CleaningMessage[] | MarketplaceMessage[]>(queryKey) || [];
      const now = new Date().toISOString();
      const optimistic =
        source === "marketplace"
          ? {
              id: `temp-${Date.now()}`,
              senderId: user?.id || "me",
              senderName: user?.firstName || "You",
              messageText: text,
              sentAt: now,
            }
          : {
              id: `temp-${Date.now()}`,
              senderId: user?.id || "me",
              senderType: "HOST" as const,
              body: text,
              sentAt: now,
            };
      queryClient.setQueryData(queryKey, [...previousMessages, optimistic]);
      setBody("");
      return { previousMessages, queryKey };
    },
    onError: (_error, _text, context) => {
      if (!context) return;
      queryClient.setQueryData(context.queryKey, context.previousMessages);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/provider-thread", source, threadId] });
      queryClient.invalidateQueries({ queryKey: ["/api/inbox/providers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const rows = useMemo(() => {
    if (!messagesQuery.data) return [];
    return (messagesQuery.data as Array<CleaningMessage | MarketplaceMessage>).map((message) => {
      const isCleaning = source === "cleaning";
      const own =
        isCleaning && "senderType" in message
          ? message.senderType === "HOST"
          : "senderId" in message && message.senderId === user?.id;

      return {
        id: message.id,
        own,
        text: "body" in message ? message.body : message.messageText,
        sentAt: message.sentAt,
      };
    });
  }, [messagesQuery.data, source]);
  const { containerRef, endRef } = useChatAutoScroll(rows);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b sticky top-0 bg-background z-50">
        <button
          className="flex items-center gap-1.5 text-sm text-muted-foreground"
          onClick={() => router.push("/inbox")}
          data-testid="button-back-provider-chat"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Go back</span>
        </button>
        <h1 className="text-lg font-semibold text-black">Provider Chat</h1>
      </div>

      <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto p-4 md:pb-4 space-y-3 chat-scroll">
        {messagesQuery.isLoading ? (
          <>
            <Skeleton className="h-10 w-2/3 rounded-md" />
            <Skeleton className="h-10 w-1/2 rounded-md" />
            <Skeleton className="h-10 w-2/3 rounded-md" />
          </>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No messages yet. Start the conversation.</p>
        ) : (
          rows.map((msg) => (
            <div key={msg.id} className={`flex ${msg.own ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-3 py-2 rounded-md text-sm leading-relaxed ${
                  msg.own ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <p>{msg.text}</p>
                <p className={`text-[10px] mt-1 ${msg.own ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <div className="chat-composer flex items-center gap-2">
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              const trimmed = body.trim();
              if (trimmed) sendMutation.mutate(trimmed);
            }
          }}
          data-testid="input-provider-chat-message"
        />
        <Button
          size="icon"
          aria-label="Send message"
          onClick={() => {
            const trimmed = body.trim();
            if (trimmed) sendMutation.mutate(trimmed);
          }}
          disabled={!body.trim() || sendMutation.isPending}
          data-testid="button-send-provider-chat"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
