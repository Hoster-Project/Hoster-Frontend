"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Send } from "lucide-react";
import { useChatAutoScroll } from "@/hooks/use-chat-auto-scroll";

interface ChatMsg {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  body: string;
  sentAt: string | null;
}

export default function ProviderSupportChatPage() {
  const router = useRouter();
  const [chatMessage, setChatMessage] = useState("");
  const [threadRequested, setThreadRequested] = useState(false);

  const { data: messages, isLoading } = useQuery<ChatMsg[]>({
    queryKey: ["/api/support/messages"],
  });

  const sendMutation = useMutation({
    mutationFn: async (body: string) => {
      const res = await apiRequest("POST", "/api/support/send", { body });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      setChatMessage("");
    },
  });

  const requestSupportMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/support/request");
      return res.json();
    },
  });

  useEffect(() => {
    if (threadRequested) return;
    requestSupportMutation.mutate();
    setThreadRequested(true);
  }, [threadRequested]);

  const handleSendChat = () => {
    if (!chatMessage.trim()) return;
    sendMutation.mutate(chatMessage.trim());
  };

  const displayMessages = messages && messages.length > 0 ? messages : [];
  const { containerRef, endRef } = useChatAutoScroll(displayMessages);
  const showWelcome = !isLoading && displayMessages.length === 0;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b sticky top-0 bg-background z-50">
        <button
          className="flex items-center gap-1.5 text-sm text-muted-foreground"
          onClick={() => router.push("/provider/settings")}
          data-testid="button-provider-back-chat"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Go back</span>
        </button>
        <h1 className="text-lg font-semibold text-black">Support Chat</h1>
      </div>

      <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 chat-scroll">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-2/3 rounded-md" />
            ))}
          </div>
        ) : (
          <>
            {showWelcome && (
              <div className="flex justify-start">
                <div className="max-w-[80%] px-3 py-2 rounded-md text-sm leading-relaxed bg-muted">
                  Welcome to Hoster support! How can we help you today?
                </div>
              </div>
            )}
            {displayMessages.map((msg, i) => (
              <div key={msg.id} className={`flex ${msg.direction === "INBOUND" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-md text-sm leading-relaxed ${msg.direction === "INBOUND" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {msg.body}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </>
        )}
      </div>

      <div className="chat-composer fixed bottom-0 left-0 right-0 z-50 flex items-center gap-2 md:sticky">
        <Input
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendChat();
            }
          }}
          data-testid="input-provider-support-message"
        />
        <Button
          size="icon"
          aria-label="Send message"
          onClick={handleSendChat}
          disabled={!chatMessage.trim() || sendMutation.isPending}
          data-testid="button-provider-send-support"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
