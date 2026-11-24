"use client";

import React, { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  ArrowRight,
  Webhook,
  Globe,
  GitFork,
  Clock,
  Terminal,
  Search,
  Check,
  Bot,
  CreditCard,
  Database,
  Bell,
  Mail,
  ShoppingBag,
} from "lucide-react";
import { getAuthToken, getActiveWorkspace } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { WorkflowGraphDefinition } from "@nexora/shared";

interface WorkflowTemplate {
  id: string;
  name: string;
  category: "Sales & Marketing" | "DevOps & Monitoring" | "Developer Tools" | "Customer Support" | "E-Commerce & Billing" | "AI & Machine Learning" | "Data Pipelines";
  description: string;
  badge?: string;
  nodeTypes: Array<{ label: string; icon: any; color: string }>;
  definition: WorkflowGraphDefinition;
}

const templates: WorkflowTemplate[] = [
  {
    id: "lead-vip-routing",
    name: "Inbound Lead Intake & VIP Routing",
    category: "Sales & Marketing",
    badge: "Popular",
    description: "Ingests customer webhook payloads, branches on lead score, and dispatches VIP notifications to CRM or Slack.",
    nodeTypes: [
      { label: "Webhook", icon: Webhook, color: "#22D3EE" },
      { label: "Condition", icon: GitFork, color: "#8B5CF6" },
      { label: "HTTP POST", icon: Globe, color: "#38BDF8" },
      { label: "Logger", icon: Terminal, color: "#F59E0B" },
    ],
    definition: {
      nodes: [
        {
          id: "webhook_lead",
          type: "webhook-trigger",
          position: { x: 350, y: 100 },
          data: { label: "Inbound Lead Webhook", config: {} },
        },
        {
          id: "check_score",
          type: "condition",
          position: { x: 350, y: 230 },
          data: {
            label: "Check: Score > 80",
            config: { variable: "trigger.score", operator: "greater_than", value: "80" },
          },
        },
        {
          id: "notify_crm",
          type: "http-request",
          position: { x: 180, y: 380 },
          data: {
            label: "Dispatch VIP to CRM",
            config: {
              method: "POST",
              url: "https://api.example.com/crm/leads",
              headers: { "Content-Type": "application/json" },
              body: { email: "{{trigger.email}}", tier: "VIP", score: "{{trigger.score}}" },
            },
          },
        },
        {
          id: "log_standard",
          type: "logger",
          position: { x: 520, y: 380 },
          data: {
            label: "Log Standard Lead",
            config: { message: "Standard lead recorded: {{trigger.email}}" },
          },
        },
      ],
      edges: [
        { id: "e1", source: "webhook_lead", target: "check_score", animated: true },
        { id: "e2", source: "check_score", target: "notify_crm", sourceHandle: "true", animated: true, style: { stroke: "#22C55E" } },
        { id: "e3", source: "check_score", target: "log_standard", sourceHandle: "false", animated: true, style: { stroke: "#EF4444" } },
      ],
    },
  },
  {
    id: "ai-sentiment-routing",
    name: "AI Sentiment Analysis & Urgent Escalation",
    category: "AI & Machine Learning",
    badge: "Recommended",
    description: "Queries OpenAI GPT to analyze incoming customer feedback. Automatically escalates negative reviews to Slack on-call.",
    nodeTypes: [
      { label: "Webhook", icon: Webhook, color: "#22D3EE" },
      { label: "OpenAI GPT", icon: Bot, color: "#A855F7" },
      { label: "Condition", icon: GitFork, color: "#8B5CF6" },
      { label: "Slack Alert", icon: Globe, color: "#EF4444" },
    ],
    definition: {
      nodes: [
        {
          id: "review_inbound",
          type: "webhook-trigger",
          position: { x: 350, y: 100 },
          data: { label: "Customer Review Webhook", config: {} },
        },
        {
          id: "openai_sentiment",
          type: "http-request",
          position: { x: 350, y: 220 },
          data: {
            label: "Analyze Sentiment via OpenAI",
            config: {
              method: "POST",
              url: "https://api.openai.com/v1/chat/completions",
              headers: { Authorization: "Bearer {{credentials.OPENAI_API_KEY}}" },
              body: { model: "gpt-4o-mini", messages: [{ role: "user", content: "Classify sentiment: {{trigger.text}}" }] },
            },
          },
        },
        {
          id: "check_negative",
          type: "condition",
          position: { x: 350, y: 350 },
          data: {
            label: "Sentiment == negative",
            config: { variable: "trigger.sentiment", operator: "equals", value: "negative" },
          },
        },
        {
          id: "alert_slack_urgent",
          type: "http-request",
          position: { x: 180, y: 490 },
          data: {
            label: "Post to Slack Urgent Channel",
            config: {
              method: "POST",
              url: "https://hooks.slack.com/services/example",
              body: { text: "🚨 Urgent Customer Escalation: {{trigger.text}}" },
            },
          },
        },
        {
          id: "log_positive",
          type: "logger",
          position: { x: 520, y: 490 },
          data: {
            label: "Log Positive Feedback",
            config: { message: "Positive sentiment recorded: {{trigger.text}}" },
          },
        },
      ],
      edges: [
        { id: "e1", source: "review_inbound", target: "openai_sentiment", animated: true },
        { id: "e2", source: "openai_sentiment", target: "check_negative", animated: true },
        { id: "e3", source: "check_negative", target: "alert_slack_urgent", sourceHandle: "true", animated: true, style: { stroke: "#22C55E" } },
        { id: "e4", source: "check_negative", target: "log_positive", sourceHandle: "false", animated: true, style: { stroke: "#EF4444" } },
      ],
    },
  },
  {
    id: "ecommerce-order-fulfillment",
    name: "E-Commerce Order Fulfillment & Expedited Routing",
    category: "E-Commerce & Billing",
    badge: "Popular",
    description: "Processes checkout webhooks. High-value orders ($150+) are flagged for VIP priority fulfillment with email notification.",
    nodeTypes: [
      { label: "Webhook", icon: Webhook, color: "#22D3EE" },
      { label: "Condition", icon: GitFork, color: "#8B5CF6" },
      { label: "Shopify API", icon: ShoppingBag, color: "#38BDF8" },
      { label: "Resend Email", icon: Mail, color: "#22C55E" },
    ],
    definition: {
      nodes: [
        {
          id: "order_webhook",
          type: "webhook-trigger",
          position: { x: 350, y: 100 },
          data: { label: "Stripe / Shopify Order", config: {} },
        },
        {
          id: "check_high_value",
          type: "condition",
          position: { x: 350, y: 230 },
          data: {
            label: "Total > $150",
            config: { variable: "trigger.total_amount", operator: "greater_than", value: "150" },
          },
        },
        {
          id: "expedited_fulfillment",
          type: "http-request",
          position: { x: 180, y: 380 },
          data: {
            label: "Tag VIP Priority Order",
            config: {
              method: "POST",
              url: "https://api.example.com/orders/expedite",
              body: { orderId: "{{trigger.order_id}}", priority: "EXPRESS_VIP" },
            },
          },
        },
        {
          id: "send_vip_confirmation",
          type: "http-request",
          position: { x: 180, y: 500 },
          data: {
            label: "Send VIP Confirmation Email",
            config: {
              method: "POST",
              url: "https://api.resend.com/emails",
              headers: { Authorization: "Bearer {{credentials.RESEND_API_KEY}}" },
              body: { to: "{{trigger.customer_email}}", subject: "Your VIP Order is Being Prepared!" },
            },
          },
        },
        {
          id: "standard_logger",
          type: "logger",
          position: { x: 520, y: 380 },
          data: {
            label: "Process Standard Order",
            config: { message: "Standard order queued for fulfillment: {{trigger.order_id}}" },
          },
        },
      ],
      edges: [
        { id: "e1", source: "order_webhook", target: "check_high_value", animated: true },
        { id: "e2", source: "check_high_value", target: "expedited_fulfillment", sourceHandle: "true", animated: true, style: { stroke: "#22C55E" } },
        { id: "e3", source: "expedited_fulfillment", target: "send_vip_confirmation", animated: true },
        { id: "e4", source: "check_high_value", target: "standard_logger", sourceHandle: "false", animated: true, style: { stroke: "#EF4444" } },
      ],
    },
  },
  {
    id: "incident-escalation-pagerduty",
    name: "Automated On-Call Incident Escalation",
    category: "DevOps & Monitoring",
    badge: "Critical",
    description: "Catches critical monitoring alerts (Datadog/Sentry), triggers high-urgency PagerDuty incidents, and notifies Slack war-room.",
    nodeTypes: [
      { label: "Webhook", icon: Webhook, color: "#22D3EE" },
      { label: "PagerDuty Event", icon: Bell, color: "#EF4444" },
      { label: "Delay (5s)", icon: Clock, color: "#A855F7" },
      { label: "Slack War-Room", icon: Globe, color: "#38BDF8" },
    ],
    definition: {
      nodes: [
        {
          id: "alert_inbound",
          type: "webhook-trigger",
          position: { x: 350, y: 100 },
          data: { label: "Inbound Sentry Alert", config: {} },
        },
        {
          id: "trigger_pagerduty",
          type: "http-request",
          position: { x: 350, y: 220 },
          data: {
            label: "Trigger PagerDuty Incident",
            config: {
              method: "POST",
              url: "https://events.pagerduty.com/v2/enqueue",
              headers: { "Content-Type": "application/json" },
              body: { routing_key: "{{credentials.PAGERDUTY_ROUTING_KEY}}", event_action: "trigger", payload: { summary: "{{trigger.error_message}}", severity: "critical" } },
            },
          },
        },
        {
          id: "pause_stabilize",
          type: "delay",
          position: { x: 350, y: 350 },
          data: { label: "Wait 5 Seconds", config: { durationSeconds: 5 } },
        },
        {
          id: "slack_warroom",
          type: "http-request",
          position: { x: 350, y: 470 },
          data: {
            label: "Post to Slack #war-room",
            config: {
              method: "POST",
              url: "{{credentials.SLACK_WEBHOOK_URL}}",
              body: { text: "🚨 High Urgency Incident Triggered on PagerDuty: {{trigger.error_message}}" },
            },
          },
        },
      ],
      edges: [
        { id: "e1", source: "alert_inbound", target: "trigger_pagerduty", animated: true },
        { id: "e2", source: "trigger_pagerduty", target: "pause_stabilize", animated: true },
        { id: "e3", source: "pause_stabilize", target: "slack_warroom", animated: true },
      ],
    },
  },
  {
    id: "form-to-airtable-discord",
    name: "Form Intake to Airtable & Discord Team Ping",
    category: "Developer Tools",
    description: "Receives form submissions, inserts a row into your Airtable Base using personal access tokens, and pings your Discord team.",
    nodeTypes: [
      { label: "Webhook", icon: Webhook, color: "#22D3EE" },
      { label: "Airtable POST", icon: Database, color: "#38BDF8" },
      { label: "Discord Ping", icon: Globe, color: "#8B5CF6" },
      { label: "Logger", icon: Terminal, color: "#F59E0B" },
    ],
    definition: {
      nodes: [
        {
          id: "form_submission",
          type: "webhook-trigger",
          position: { x: 350, y: 100 },
          data: { label: "Contact Form Webhook", config: {} },
        },
        {
          id: "insert_airtable",
          type: "http-request",
          position: { x: 350, y: 220 },
          data: {
            label: "Create Airtable Record",
            config: {
              method: "POST",
              url: "https://api.airtable.com/v0/appExample/Leads",
              headers: { Authorization: "Bearer {{credentials.AIRTABLE_API_KEY}}", "Content-Type": "application/json" },
              body: { fields: { Name: "{{trigger.name}}", Email: "{{trigger.email}}", Message: "{{trigger.message}}" } },
            },
          },
        },
        {
          id: "discord_notify",
          type: "http-request",
          position: { x: 350, y: 350 },
          data: {
            label: "Ping Discord Channel",
            config: {
              method: "POST",
              url: "{{credentials.DISCORD_WEBHOOK_URL}}",
              body: { content: "📩 New Form Submission from {{trigger.name}} ({{trigger.email}})" },
            },
          },
        },
        {
          id: "log_complete",
          type: "logger",
          position: { x: 350, y: 470 },
          data: { label: "Log Form Archived", config: { message: "Form sync finished: {{trigger.email}}" } },
        },
      ],
      edges: [
        { id: "e1", source: "form_submission", target: "insert_airtable", animated: true },
        { id: "e2", source: "insert_airtable", target: "discord_notify", animated: true },
        { id: "e3", source: "discord_notify", target: "log_complete", animated: true },
      ],
    },
  },
  {
    id: "stripe-churn-dunning",
    name: "Stripe Subscription Churn Prevention & Dunning",
    category: "E-Commerce & Billing",
    description: "Detects failed subscription payments from Stripe. Immediately triggers payment retry emails and logs grace period status.",
    nodeTypes: [
      { label: "Webhook", icon: Webhook, color: "#22D3EE" },
      { label: "Condition", icon: GitFork, color: "#8B5CF6" },
      { label: "Resend Dunning", icon: Mail, color: "#22C55E" },
      { label: "Offboard Survey", icon: Globe, color: "#F59E0B" },
    ],
    definition: {
      nodes: [
        {
          id: "stripe_sub_event",
          type: "webhook-trigger",
          position: { x: 350, y: 100 },
          data: { label: "Stripe Subscription Deleted", config: {} },
        },
        {
          id: "check_payment_fail",
          type: "condition",
          position: { x: 350, y: 230 },
          data: {
            label: "Reason == payment_failed",
            config: { variable: "trigger.cancellation_reason", operator: "equals", value: "payment_failed" },
          },
        },
        {
          id: "send_dunning_email",
          type: "http-request",
          position: { x: 180, y: 380 },
          data: {
            label: "Send Dunning Recovery Email",
            config: {
              method: "POST",
              url: "https://api.resend.com/emails",
              headers: { Authorization: "Bearer {{credentials.RESEND_API_KEY}}" },
              body: { to: "{{trigger.customer_email}}", subject: "Action Required: Update payment method to keep your account active" },
            },
          },
        },
        {
          id: "send_exit_survey",
          type: "http-request",
          position: { x: 520, y: 380 },
          data: {
            label: "Dispatch Exit Feedback Survey",
            config: {
              method: "POST",
              url: "https://api.resend.com/emails",
              headers: { Authorization: "Bearer {{credentials.RESEND_API_KEY}}" },
              body: { to: "{{trigger.customer_email}}", subject: "We're sorry to see you go! Help us improve." },
            },
          },
        },
      ],
      edges: [
        { id: "e1", source: "stripe_sub_event", target: "check_payment_fail", animated: true },
        { id: "e2", source: "check_payment_fail", target: "send_dunning_email", sourceHandle: "true", animated: true, style: { stroke: "#22C55E" } },
        { id: "e3", source: "check_payment_fail", target: "send_exit_survey", sourceHandle: "false", animated: true, style: { stroke: "#EF4444" } },
      ],
    },
  },
  {
    id: "api-health-monitor",
    name: "API Uptime Monitor & Incident Alert",
    category: "DevOps & Monitoring",
    badge: "Recommended",
    description: "Performs HTTP health checks on external APIs, verifies HTTP 200 response, and triggers alerts on degradation.",
    nodeTypes: [
      { label: "Manual Trigger", icon: Terminal, color: "#22D3EE" },
      { label: "HTTP GET", icon: Globe, color: "#38BDF8" },
      { label: "Condition", icon: GitFork, color: "#8B5CF6" },
      { label: "Slack Alert", icon: Globe, color: "#EF4444" },
    ],
    definition: {
      nodes: [
        {
          id: "manual_poll",
          type: "manual-trigger",
          position: { x: 350, y: 100 },
          data: { label: "Trigger Health Check", config: {} },
        },
        {
          id: "http_ping",
          type: "http-request",
          position: { x: 350, y: 220 },
          data: {
            label: "GET /health Endpoint",
            config: { method: "GET", url: "https://api.github.com" },
          },
        },
        {
          id: "check_http_200",
          type: "condition",
          position: { x: 350, y: 350 },
          data: {
            label: "Verify HTTP 200",
            config: { variable: "steps.http_ping.status", operator: "equals", value: "200" },
          },
        },
        {
          id: "log_healthy",
          type: "logger",
          position: { x: 180, y: 490 },
          data: {
            label: "Log Healthy",
            config: { message: "Service is fully operational with HTTP 200." },
          },
        },
        {
          id: "post_alert",
          type: "http-request",
          position: { x: 520, y: 490 },
          data: {
            label: "Alert On-Call Webhook",
            config: {
              method: "POST",
              url: "https://api.example.com/alerts",
              body: { text: "⚠️ Health check failed! Status: {{steps.http_ping.status}}" },
            },
          },
        },
      ],
      edges: [
        { id: "e1", source: "manual_poll", target: "http_ping", animated: true },
        { id: "e2", source: "http_ping", target: "check_http_200", animated: true },
        { id: "e3", source: "check_http_200", target: "log_healthy", sourceHandle: "true", animated: true, style: { stroke: "#22C55E" } },
        { id: "e4", source: "check_http_200", target: "post_alert", sourceHandle: "false", animated: true, style: { stroke: "#EF4444" } },
      ],
    },
  },
  {
    id: "github-issue-router",
    name: "GitHub Issues to Discord Dispatcher",
    category: "Developer Tools",
    description: "Receives GitHub webhook events, inspects issue action type, and posts formatted notifications to Discord channels.",
    nodeTypes: [
      { label: "Webhook", icon: Webhook, color: "#22D3EE" },
      { label: "Condition", icon: GitFork, color: "#8B5CF6" },
      { label: "Discord POST", icon: Globe, color: "#38BDF8" },
    ],
    definition: {
      nodes: [
        {
          id: "github_webhook",
          type: "webhook-trigger",
          position: { x: 350, y: 100 },
          data: { label: "GitHub Webhook Listener", config: {} },
        },
        {
          id: "check_opened",
          type: "condition",
          position: { x: 350, y: 230 },
          data: {
            label: "Action == opened",
            config: { variable: "trigger.action", operator: "equals", value: "opened" },
          },
        },
        {
          id: "discord_post",
          type: "http-request",
          position: { x: 220, y: 380 },
          data: {
            label: "Post to Discord Channel",
            config: {
              method: "POST",
              url: "https://discord.com/api/webhooks/example",
              body: { content: "New Issue Opened: {{trigger.issue.title}} by {{trigger.sender.login}}" },
            },
          },
        },
        {
          id: "ignore_log",
          type: "logger",
          position: { x: 480, y: 380 },
          data: {
            label: "Log Ignored Action",
            config: { message: "Non-opened event ignored: {{trigger.action}}" },
          },
        },
      ],
      edges: [
        { id: "e1", source: "github_webhook", target: "check_opened", animated: true },
        { id: "e2", source: "check_opened", target: "discord_post", sourceHandle: "true", animated: true, style: { stroke: "#22C55E" } },
        { id: "e3", source: "check_opened", target: "ignore_log", sourceHandle: "false", animated: true, style: { stroke: "#EF4444" } },
      ],
    },
  },
  {
    id: "data-sync-etl",
    name: "Automated Data Ingestion & Sync Pipeline",
    category: "Data Pipelines",
    description: "Fetches remote batch data via authenticated HTTP GET, validates response status, and posts normalized rows to internal warehouse.",
    nodeTypes: [
      { label: "Manual Trigger", icon: Terminal, color: "#22D3EE" },
      { label: "Fetch API", icon: Globe, color: "#38BDF8" },
      { label: "Condition", icon: GitFork, color: "#8B5CF6" },
      { label: "Ingest POST", icon: Database, color: "#22C55E" },
    ],
    definition: {
      nodes: [
        {
          id: "sync_trigger",
          type: "manual-trigger",
          position: { x: 350, y: 100 },
          data: { label: "Trigger ETL Ingestion", config: {} },
        },
        {
          id: "fetch_remote",
          type: "http-request",
          position: { x: 350, y: 220 },
          data: {
            label: "Fetch External Records",
            config: { method: "GET", url: "https://api.example.com/data/export" },
          },
        },
        {
          id: "check_success",
          type: "condition",
          position: { x: 350, y: 350 },
          data: {
            label: "Status == 200",
            config: { variable: "steps.fetch_remote.status", operator: "equals", value: "200" },
          },
        },
        {
          id: "post_warehouse",
          type: "http-request",
          position: { x: 180, y: 490 },
          data: {
            label: "Bulk Ingest to Warehouse",
            config: {
              method: "POST",
              url: "https://warehouse.example.internal/ingest",
              body: { payload: "{{steps.fetch_remote.data}}" },
            },
          },
        },
        {
          id: "log_sync_fail",
          type: "logger",
          position: { x: 520, y: 490 },
          data: {
            label: "Log Sync Failure",
            config: { message: "ETL Sync failed with HTTP status {{steps.fetch_remote.status}}" },
          },
        },
      ],
      edges: [
        { id: "e1", source: "sync_trigger", target: "fetch_remote", animated: true },
        { id: "e2", source: "fetch_remote", target: "check_success", animated: true },
        { id: "e3", source: "check_success", target: "post_warehouse", sourceHandle: "true", animated: true, style: { stroke: "#22C55E" } },
        { id: "e4", source: "check_success", target: "log_sync_fail", sourceHandle: "false", animated: true, style: { stroke: "#EF4444" } },
      ],
    },
  },
  {
    id: "delayed-autoresponder",
    name: "Delayed Auto-Responder & Pipeline Check",
    category: "Customer Support",
    description: "Introduces a controlled non-blocking pause before sending automated customer follow-ups and recording audit milestones.",
    nodeTypes: [
      { label: "Webhook", icon: Webhook, color: "#22D3EE" },
      { label: "Delay (3s)", icon: Clock, color: "#A855F7" },
      { label: "HTTP POST", icon: Globe, color: "#38BDF8" },
      { label: "Audit Log", icon: Terminal, color: "#F59E0B" },
    ],
    definition: {
      nodes: [
        {
          id: "inbound_ticket",
          type: "webhook-trigger",
          position: { x: 350, y: 100 },
          data: { label: "Inbound Support Request", config: {} },
        },
        {
          id: "safe_pause",
          type: "delay",
          position: { x: 350, y: 220 },
          data: { label: "Wait 3 Seconds", config: { durationSeconds: 3 } },
        },
        {
          id: "dispatch_reply",
          type: "http-request",
          position: { x: 350, y: 340 },
          data: {
            label: "Send Auto-Reply",
            config: {
              method: "POST",
              url: "https://api.example.com/support/reply",
              body: { ticketId: "{{trigger.id}}", message: "Your request has been received." },
            },
          },
        },
        {
          id: "audit_logger",
          type: "logger",
          position: { x: 350, y: 460 },
          data: {
            label: "Audit Milestone",
            config: { message: "Auto-responder completed for ticket: {{trigger.id}}" },
          },
        },
      ],
      edges: [
        { id: "e1", source: "inbound_ticket", target: "safe_pause", animated: true },
        { id: "e2", source: "safe_pause", target: "dispatch_reply", animated: true },
        { id: "e3", source: "dispatch_reply", target: "audit_logger", animated: true },
      ],
    },
  },
  {
    id: "hubspot-crm-enrichment",
    name: "HubSpot CRM Contact Sync & Deal Routing",
    category: "Sales & Marketing",
    badge: "CRM",
    description: "Captures incoming lead forms, queries HubSpot to enrich contact details, and automatically creates an escalated high-value deal.",
    nodeTypes: [
      { label: "Webhook", icon: Webhook, color: "#22D3EE" },
      { label: "HubSpot POST", icon: Globe, color: "#38BDF8" },
      { label: "Condition", icon: GitFork, color: "#8B5CF6" },
      { label: "VIP Deal", icon: CreditCard, color: "#22C55E" },
    ],
    definition: {
      nodes: [
        {
          id: "trigger_lead",
          type: "webhook-trigger",
          position: { x: 350, y: 100 },
          data: { label: "Inbound Lead Webhook", config: {} },
        },
        {
          id: "enrich_hubspot",
          type: "http-request",
          position: { x: 350, y: 220 },
          data: {
            label: "Create/Update Contact in HubSpot",
            config: {
              method: "POST",
              url: "https://api.hubapi.com/crm/v3/objects/contacts",
              headers: { Authorization: "Bearer {{credentials.HUBSPOT_ACCESS_TOKEN}}" },
              body: { properties: { email: "{{trigger.email}}", firstname: "{{trigger.name}}" } },
            },
          },
        },
        {
          id: "check_deal_value",
          type: "condition",
          position: { x: 350, y: 350 },
          data: {
            label: "Budget > 10,000",
            config: { variable: "trigger.budget", operator: "greater_than", value: "10000" },
          },
        },
        {
          id: "create_vip_deal",
          type: "http-request",
          position: { x: 180, y: 490 },
          data: {
            label: "Create Enterprise Deal",
            config: {
              method: "POST",
              url: "https://api.hubapi.com/crm/v3/objects/deals",
              headers: { Authorization: "Bearer {{credentials.HUBSPOT_ACCESS_TOKEN}}" },
              body: { properties: { dealname: "VIP Enterprise Deal: {{trigger.name}}", amount: "{{trigger.budget}}" } },
            },
          },
        },
        {
          id: "log_standard_deal",
          type: "logger",
          position: { x: 520, y: 490 },
          data: {
            label: "Log Standard Tier Lead",
            config: { message: "Standard budget tier logged for lead: {{trigger.email}}" },
          },
        },
      ],
      edges: [
        { id: "e1", source: "trigger_lead", target: "enrich_hubspot", animated: true },
        { id: "e2", source: "enrich_hubspot", target: "check_deal_value", animated: true },
        { id: "e3", source: "check_deal_value", target: "create_vip_deal", sourceHandle: "true", animated: true, style: { stroke: "#22C55E" } },
        { id: "e4", source: "check_deal_value", target: "log_standard_deal", sourceHandle: "false", animated: true, style: { stroke: "#EF4444" } },
      ],
    },
  },
  {
    id: "cloud-storage-processor",
    name: "Cloud Storage File Ingestion & Lambda Trigger",
    category: "DevOps & Monitoring",
    description: "Triggered when files are uploaded to object storage (S3/R2). Validates file extension and size, then invokes AWS Lambda or processing pipeline.",
    nodeTypes: [
      { label: "Storage Event", icon: Webhook, color: "#22D3EE" },
      { label: "Condition", icon: GitFork, color: "#8B5CF6" },
      { label: "Lambda POST", icon: Globe, color: "#38BDF8" },
      { label: "Audit Log", icon: Terminal, color: "#F59E0B" },
    ],
    definition: {
      nodes: [
        {
          id: "s3_event_trigger",
          type: "webhook-trigger",
          position: { x: 350, y: 100 },
          data: { label: "S3 ObjectCreated Webhook", config: {} },
        },
        {
          id: "check_file_type",
          type: "condition",
          position: { x: 350, y: 230 },
          data: {
            label: "File Ext == pdf",
            config: { variable: "trigger.extension", operator: "equals", value: "pdf" },
          },
        },
        {
          id: "invoke_worker",
          type: "http-request",
          position: { x: 180, y: 380 },
          data: {
            label: "Trigger Ingestion Worker",
            config: {
              method: "POST",
              url: "https://api.example.com/workers/ingest",
              body: { bucket: "{{trigger.bucket}}", key: "{{trigger.key}}", size: "{{trigger.size}}" },
            },
          },
        },
        {
          id: "log_skip",
          type: "logger",
          position: { x: 520, y: 380 },
          data: {
            label: "Log Non-PDF File",
            config: { message: "Skipping non-pdf file upload: {{trigger.key}}" },
          },
        },
      ],
      edges: [
        { id: "e1", source: "s3_event_trigger", target: "check_file_type", animated: true },
        { id: "e2", source: "check_file_type", target: "invoke_worker", sourceHandle: "true", animated: true, style: { stroke: "#22C55E" } },
        { id: "e3", source: "check_file_type", target: "log_skip", sourceHandle: "false", animated: true, style: { stroke: "#EF4444" } },
      ],
    },
  },
  {
    id: "churn-nps-escalation",
    name: "Customer Churn Risk & NPS Survey Auto-Response",
    category: "Customer Support",
    badge: "Automated",
    description: "Listens for customer satisfaction ratings. Dispatches an immediate high-priority recovery alert to Slack for detractors (score < 6) or thanks promoters.",
    nodeTypes: [
      { label: "NPS Webhook", icon: Webhook, color: "#22D3EE" },
      { label: "Condition", icon: GitFork, color: "#8B5CF6" },
      { label: "Slack Recovery", icon: Bell, color: "#EF4444" },
      { label: "Email Thank You", icon: Mail, color: "#22C55E" },
    ],
    definition: {
      nodes: [
        {
          id: "nps_trigger",
          type: "webhook-trigger",
          position: { x: 350, y: 100 },
          data: { label: "NPS Survey Webhook", config: {} },
        },
        {
          id: "check_detractor",
          type: "condition",
          position: { x: 350, y: 230 },
          data: {
            label: "Score < 6 (Detractor)",
            config: { variable: "trigger.score", operator: "less_than", value: "6" },
          },
        },
        {
          id: "slack_urgent",
          type: "http-request",
          position: { x: 180, y: 380 },
          data: {
            label: "Notify Retention Team (Slack)",
            config: {
              method: "POST",
              url: "https://hooks.slack.com/services/retention/alert",
              body: { text: "URGENT: Detractor alert from {{trigger.email}} with score {{trigger.score}}! Feedback: {{trigger.comment}}" },
            },
          },
        },
        {
          id: "email_promoter",
          type: "http-request",
          position: { x: 520, y: 380 },
          data: {
            label: "Send Promoter Reward (Resend)",
            config: {
              method: "POST",
              url: "https://api.resend.com/emails",
              headers: { Authorization: "Bearer {{credentials.RESEND_API_KEY}}" },
              body: { to: "{{trigger.email}}", subject: "Thank you for the high rating!", text: "Here is 20% off your next renewal." },
            },
          },
        },
      ],
      edges: [
        { id: "e1", source: "nps_trigger", target: "check_detractor", animated: true },
        { id: "e2", source: "check_detractor", target: "slack_urgent", sourceHandle: "true", animated: true, style: { stroke: "#EF4444" } },
        { id: "e3", source: "check_detractor", target: "email_promoter", sourceHandle: "false", animated: true, style: { stroke: "#22C55E" } },
      ],
    },
  },
  {
    id: "database-health-monitor",
    name: "Scheduled DB Health Check & DevOps Alert",
    category: "DevOps & Monitoring",
    description: "Pings a health-check endpoint on a scheduled cadence. Evaluates response code and triggers a PagerDuty incident if metrics degrade.",
    nodeTypes: [
      { label: "Cron Check", icon: Terminal, color: "#22D3EE" },
      { label: "Ping API", icon: Globe, color: "#38BDF8" },
      { label: "Condition", icon: GitFork, color: "#8B5CF6" },
      { label: "PagerDuty Alert", icon: Bell, color: "#EF4444" },
    ],
    definition: {
      nodes: [
        {
          id: "db_check_trigger",
          type: "manual-trigger",
          position: { x: 350, y: 100 },
          data: { label: "Scheduled Health Pulse", config: {} },
        },
        {
          id: "ping_health_endpoint",
          type: "http-request",
          position: { x: 350, y: 220 },
          data: {
            label: "Check Production DB Health",
            config: { method: "GET", url: "https://db-monitor.example.com/health" },
          },
        },
        {
          id: "check_status",
          type: "condition",
          position: { x: 350, y: 350 },
          data: {
            label: "Status == 200",
            config: { variable: "steps.ping_health_endpoint.status", operator: "equals", value: "200" },
          },
        },
        {
          id: "log_healthy",
          type: "logger",
          position: { x: 180, y: 490 },
          data: {
            label: "Record Healthy Heartbeat",
            config: { message: "DB cluster verified healthy at timestamp: {{steps.ping_health_endpoint.timestamp}}" },
          },
        },
        {
          id: "pagerduty_incident",
          type: "http-request",
          position: { x: 520, y: 490 },
          data: {
            label: "Trigger PagerDuty Incident",
            config: {
              method: "POST",
              url: "https://events.pagerduty.com/v2/enqueue",
              headers: { Authorization: "Token token={{credentials.PAGERDUTY_ROUTING_KEY}}" },
              body: { routing_key: "{{credentials.PAGERDUTY_ROUTING_KEY}}", event_action: "trigger", payload: { summary: "DB Health degradation detected!" } },
            },
          },
        },
      ],
      edges: [
        { id: "e1", source: "db_check_trigger", target: "ping_health_endpoint", animated: true },
        { id: "e2", source: "ping_health_endpoint", target: "check_status", animated: true },
        { id: "e3", source: "check_status", target: "log_healthy", sourceHandle: "true", animated: true, style: { stroke: "#22C55E" } },
        { id: "e4", source: "check_status", target: "pagerduty_incident", sourceHandle: "false", animated: true, style: { stroke: "#EF4444" } },
      ],
    },
  },
  {
    id: "github-pr-ci-gate",
    name: "Pull Request Automated Review & CI Gate",
    category: "Developer Tools",
    description: "Intercepts pull request webhook events, checks target branch (e.g. main), triggers an external automated test runner, and logs audit metrics.",
    nodeTypes: [
      { label: "PR Webhook", icon: Webhook, color: "#22D3EE" },
      { label: "Condition", icon: GitFork, color: "#8B5CF6" },
      { label: "Delay (2s)", icon: Clock, color: "#A855F7" },
      { label: "Trigger CI", icon: Globe, color: "#38BDF8" },
      { label: "Audit Log", icon: Terminal, color: "#F59E0B" },
    ],
    definition: {
      nodes: [
        {
          id: "pr_trigger",
          type: "webhook-trigger",
          position: { x: 350, y: 80 },
          data: { label: "GitHub PR Opened Webhook", config: {} },
        },
        {
          id: "check_target_main",
          type: "condition",
          position: { x: 350, y: 190 },
          data: {
            label: "Base Ref == main",
            config: { variable: "trigger.pull_request.base.ref", operator: "equals", value: "main" },
          },
        },
        {
          id: "cooldown_delay",
          type: "delay",
          position: { x: 200, y: 310 },
          data: { label: "Throttle 2s", config: { durationSeconds: 2 } },
        },
        {
          id: "post_ci_trigger",
          type: "http-request",
          position: { x: 200, y: 430 },
          data: {
            label: "Dispatch CI Runner Job",
            config: {
              method: "POST",
              url: "https://ci.example.com/builds",
              headers: { Authorization: "Bearer {{credentials.GITHUB_TOKEN}}" },
              body: { sha: "{{trigger.pull_request.head.sha}}", repo: "{{trigger.repository.full_name}}" },
            },
          },
        },
        {
          id: "log_skip_branch",
          type: "logger",
          position: { x: 520, y: 310 },
          data: {
            label: "Skip Feature Branch",
            config: { message: "Skipped non-main branch: {{trigger.pull_request.base.ref}}" },
          },
        },
      ],
      edges: [
        { id: "e1", source: "pr_trigger", target: "check_target_main", animated: true },
        { id: "e2", source: "check_target_main", target: "cooldown_delay", sourceHandle: "true", animated: true, style: { stroke: "#22C55E" } },
        { id: "e3", source: "cooldown_delay", target: "post_ci_trigger", animated: true },
        { id: "e4", source: "check_target_main", target: "log_skip_branch", sourceHandle: "false", animated: true, style: { stroke: "#EF4444" } },
      ],
    },
  },
];

const categories = [
  "All",
  "Sales & Marketing",
  "DevOps & Monitoring",
  "AI & Machine Learning",
  "E-Commerce & Billing",
  "Developer Tools",
  "Customer Support",
  "Data Pipelines",
];

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cloningId, setCloningId] = useState<string | null>(null);

  const filteredTemplates = templates.filter((tpl) => {
    const matchesCat = selectedCategory === "All" || tpl.category === selectedCategory;
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleUseTemplate = async (template: WorkflowTemplate) => {
    setCloningId(template.id);
    try {
      const token = getAuthToken();
      const workspace = getActiveWorkspace();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

      // 1. Create workflow
      const res = await fetch(`${apiUrl}/workflows`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspace?.id || "",
        },
        body: JSON.stringify({
          name: `${template.name}`,
          description: template.description,
        }),
      });

      if (!res.ok) throw new Error("Failed to create workflow from template");
      const created = await res.json();

      // 2. Save definition
      await fetch(`${apiUrl}/workflows/${created.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-workspace-id": workspace?.id || "",
        },
        body: JSON.stringify({
          definition: template.definition,
        }),
      });

      // 3. Open in canvas
      router.push(`/workflows/${created.id}`);
    } catch (err: any) {
      alert(`Error cloning template: ${err.message}`);
      setCloningId(null);
    }
  };

  return (
    <>
      <TopBar
        title="Workflow Templates Gallery"
        subtitle="10 production-ready DAG blueprints to accelerate your automation architecture."
      />

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl">
        {/* Banner */}
        <div className="bg-[#172D43]/40 border border-[#8B5CF6]/30 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#8B5CF6] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Production-Ready Automation Blueprints ({templates.length})</h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed mt-0.5">
              Click <strong className="text-white">Use Template</strong> on any blueprint to clone a verified, DAG-validated automation directly into your workspace. Modify handles, secrets, or condition values directly in the canvas.
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? "bg-[#22D3EE] text-[#101827] font-semibold"
                    : "bg-[#172D43]/40 text-[#94A3B8] hover:text-white border border-[#1E293B]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#101827] border border-[#2A4365] rounded-lg text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#22D3EE]"
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTemplates.map((template) => (
            <Card key={template.id} hoverEffect className="flex flex-col justify-between p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-medium text-[#22D3EE] uppercase tracking-wider">
                    {template.category}
                  </span>
                  {template.badge && (
                    <Badge variant={template.badge === "Popular" ? "cyan" : template.badge === "Recommended" ? "violet" : "error"}>
                      {template.badge}
                    </Badge>
                  )}
                </div>

                <h3 className="text-base font-semibold text-white tracking-tight">{template.name}</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{template.description}</p>

                {/* Node Sequence Diagram */}
                <div className="pt-2">
                  <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block mb-1.5">
                    DAG Pipeline Sequence
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {template.nodeTypes.map((nt, idx) => {
                      const Icon = nt.icon;
                      return (
                        <React.Fragment key={idx}>
                          <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#101827] border border-[#1E293B] text-[10px] font-mono text-white">
                            <Icon className="w-3 h-3" style={{ color: nt.color }} />
                            <span>{nt.label}</span>
                          </div>
                          {idx < template.nodeTypes.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-[#64748B]" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-[#1E293B] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#64748B]">
                  {template.definition.nodes.length} Nodes • {template.definition.edges.length} Edges
                </span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleUseTemplate(template)}
                  isLoading={cloningId === template.id}
                  className="gap-1.5 text-xs"
                >
                  <span>Use Template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
