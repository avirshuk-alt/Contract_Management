"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AiBadge } from "@/components/ai-badge"
import {
  Bot,
  Calendar,
  AlertTriangle,
  Mail,
  FileSearch,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Settings,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react"

interface Workflow {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  trigger: string
  actions: string[]
  enabled: boolean
  lastRun?: string
  runsToday: number
  successRate: number
}

const initialWorkflows: Workflow[] = [
  {
    id: "renewal-reminder",
    name: "Renewal Reminder Agent",
    description: "Automatically sends renewal reminders 90, 60, and 30 days before contract expiration",
    icon: <Calendar className="h-5 w-5" />,
    trigger: "Contract expiration approaching",
    actions: ["Draft email", "Send to stakeholders", "Create calendar event"],
    enabled: true,
    lastRun: "2 hours ago",
    runsToday: 3,
    successRate: 100,
  },
  {
    id: "risk-detection",
    name: "Risk Detection Agent",
    description: "Scans new contracts for high-risk clauses and unusual terms",
    icon: <AlertTriangle className="h-5 w-5" />,
    trigger: "New contract uploaded",
    actions: ["Analyze clauses", "Flag risks", "Notify legal team"],
    enabled: true,
    lastRun: "45 minutes ago",
    runsToday: 7,
    successRate: 98,
  },
  {
    id: "obligation-tracker",
    name: "Obligation Tracker",
    description: "Monitors contract obligations and sends alerts for upcoming deadlines",
    icon: <Clock className="h-5 w-5" />,
    trigger: "Obligation deadline approaching",
    actions: ["Extract deadlines", "Send reminders", "Update status"],
    enabled: true,
    lastRun: "1 hour ago",
    runsToday: 12,
    successRate: 100,
  },
  {
    id: "compliance-check",
    name: "Compliance Checker",
    description: "Validates contracts against company policies and regulatory requirements",
    icon: <FileSearch className="h-5 w-5" />,
    trigger: "Contract review requested",
    actions: ["Check policies", "Verify compliance", "Generate report"],
    enabled: false,
    lastRun: "Yesterday",
    runsToday: 0,
    successRate: 95,
  },
  {
    id: "spend-analyzer",
    name: "Spend Analyzer",
    description: "Analyzes contract values and identifies cost optimization opportunities",
    icon: <Zap className="h-5 w-5" />,
    trigger: "Monthly analysis schedule",
    actions: ["Aggregate spend", "Identify savings", "Generate insights"],
    enabled: true,
    lastRun: "3 days ago",
    runsToday: 0,
    successRate: 100,
  },
  {
    id: "email-drafter",
    name: "Email Drafter",
    description: "Drafts professional emails for supplier communications",
    icon: <Mail className="h-5 w-5" />,
    trigger: "Manual trigger or obligation due",
    actions: ["Analyze context", "Draft email", "Queue for review"],
    enabled: true,
    lastRun: "30 minutes ago",
    runsToday: 5,
    successRate: 100,
  },
]

interface WorkflowRun {
  id: string
  workflowName: string
  status: "success" | "failed" | "running"
  startedAt: string
  duration: string
  details: string
}

const recentRuns: WorkflowRun[] = [
  {
    id: "1",
    workflowName: "Risk Detection Agent",
    status: "success",
    startedAt: "45 minutes ago",
    duration: "12s",
    details: "Analyzed GlobalTech MSA - flagged 2 high-risk clauses",
  },
  {
    id: "2",
    workflowName: "Obligation Tracker",
    status: "success",
    startedAt: "1 hour ago",
    duration: "8s",
    details: "Sent reminder for AWS payment deadline",
  },
  {
    id: "3",
    workflowName: "Renewal Reminder Agent",
    status: "success",
    startedAt: "2 hours ago",
    duration: "15s",
    details: "Drafted renewal email for Acme Corp contract",
  },
  {
    id: "4",
    workflowName: "Email Drafter",
    status: "running",
    startedAt: "Just now",
    duration: "-",
    details: "Drafting negotiation email for DataFlow license renewal",
  },
  {
    id: "5",
    workflowName: "Spend Analyzer",
    status: "failed",
    startedAt: "3 days ago",
    duration: "45s",
    details: "API timeout - retried successfully",
  },
]

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState(initialWorkflows)
  const [createOpen, setCreateOpen] = useState(false)

  const toggleWorkflow = (id: string) => {
    setWorkflows(
      workflows.map((w) =>
        w.id === id ? { ...w, enabled: !w.enabled } : w
      )
    )
  }

  const totalRunsToday = workflows.reduce((sum, w) => sum + w.runsToday, 0)
  const activeWorkflows = workflows.filter((w) => w.enabled).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agentic Workflows</h1>
          <p className="text-muted-foreground">
            AI-powered automations that work around the clock
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Create New Workflow
              </DialogTitle>
              <DialogDescription>
                Configure an AI agent to automate contract management tasks
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workflow Name</Label>
                <Input id="name" placeholder="e.g., Contract Expiration Alert" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trigger">Trigger Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upload">New contract uploaded</SelectItem>
                    <SelectItem value="expiration">Contract expiration approaching</SelectItem>
                    <SelectItem value="obligation">Obligation deadline approaching</SelectItem>
                    <SelectItem value="schedule">Scheduled (daily/weekly/monthly)</SelectItem>
                    <SelectItem value="manual">Manual trigger</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="actions">AI Actions</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analyze">Analyze contract</SelectItem>
                    <SelectItem value="extract">Extract key terms</SelectItem>
                    <SelectItem value="email">Draft email</SelectItem>
                    <SelectItem value="notify">Send notification</SelectItem>
                    <SelectItem value="report">Generate report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this workflow should do..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setCreateOpen(false)}>
                <Bot className="mr-2 h-4 w-4" />
                Create Agent
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWorkflows}</div>
            <p className="text-xs text-muted-foreground">of {workflows.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Runs Today</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRunsToday}</div>
            <p className="text-xs text-muted-foreground">automated actions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.2%</div>
            <p className="text-xs text-muted-foreground">last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47h</div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Workflows List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Configured Workflows</h2>
          <div className="space-y-3">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        {workflow.icon}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{workflow.name}</h3>
                          <AiBadge />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {workflow.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          <Badge variant="outline" className="text-xs">
                            <Zap className="mr-1 h-3 w-3" />
                            {workflow.trigger}
                          </Badge>
                          {workflow.actions.map((action) => (
                            <Badge
                              key={action}
                              variant="secondary"
                              className="text-xs"
                            >
                              {action}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                          {workflow.lastRun && (
                            <span>Last run: {workflow.lastRun}</span>
                          )}
                          <span>{workflow.runsToday} runs today</span>
                          <span>{workflow.successRate}% success</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={!workflow.enabled}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Switch
                        checked={workflow.enabled}
                        onCheckedChange={() => toggleWorkflow(workflow.id)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Runs */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Recent Runs</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentRuns.map((run) => (
                  <div key={run.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 rounded-full p-1 ${
                          run.status === "success"
                            ? "bg-success/10 text-success"
                            : run.status === "failed"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {run.status === "success" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : run.status === "failed" ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{run.workflowName}</p>
                          <span className="text-xs text-muted-foreground">
                            {run.duration}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {run.details}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {run.startedAt}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Button variant="outline" className="w-full">
            View All Runs
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
