/**
 * useAgentConversations Hook
 * Manages agent conversation state and loading logic (extracted from AgentsPage)
 */

import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

export function useAgentConversations(agents) {
  const [conversations, setConversations] = useState({});
  const [activeConvId, setActiveConvId] = useState({});
  const [messages, setMessages] = useState({});
  const unsubscribeRef = useRef({});

  // Load all conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      const loadedConvs = {};
      const lastActive = {};
      
      for (const ag of agents) {
        const agentConvs = await base44.agents.listConversations({ agent_name: ag.name });
        loadedConvs[ag.name] = agentConvs || [];
        
        if (agentConvs && agentConvs.length > 0) {
          lastActive[ag.name] = agentConvs[0].id;
        }
      }
      
      setConversations(loadedConvs);
      setActiveConvId(lastActive);
    };
    
    if (agents.length > 0) loadConversations();
  }, [agents.length]);

  const startNewConversation = async (agentName) => {
    const conv = await base44.agents.createConversation({
      agent_name: agentName,
      metadata: { name: `${agentName} - ${new Date().toLocaleString()}` },
    });
    setConversations(prev => ({ ...prev, [agentName]: [conv, ...(prev[agentName] || [])] }));
    setActiveConvId(prev => ({ ...prev, [agentName]: conv.id }));
    setMessages(prev => ({ ...prev, [`${agentName}:${conv.id}`]: conv.messages || [] }));

    // Subscribe to updates
    if (unsubscribeRef.current[conv.id]) unsubscribeRef.current[conv.id]();
    const unsub = base44.agents.subscribeToConversation(conv.id, (data) => {
      setMessages(prev => ({ ...prev, [`${agentName}:${conv.id}`]: data.messages || [] }));
    });
    unsubscribeRef.current[conv.id] = unsub;

    return conv;
  };

  const loadConversation = async (agentName, convId) => {
    setActiveConvId(prev => ({ ...prev, [agentName]: convId }));

    const key = `${agentName}:${convId}`;
    if (!messages[key]) {
      const conv = await base44.agents.getConversation(convId);
      setMessages(prev => ({ ...prev, [key]: conv.messages || [] }));
    }

    // Subscribe to updates
    if (unsubscribeRef.current[convId]) unsubscribeRef.current[convId]();
    const unsub = base44.agents.subscribeToConversation(convId, (data) => {
      setMessages(prev => ({ ...prev, [key]: data.messages || [] }));
    });
    unsubscribeRef.current[convId] = unsub;
  };

  return {
    conversations,
    activeConvId,
    messages,
    setMessages,
    startNewConversation,
    loadConversation,
    unsubscribeRef,
  };
}