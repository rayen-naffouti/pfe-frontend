"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminHeader } from "@/components/AdminHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ErrorState, LoadingState } from "@/components/DataState"
import { automationApi, getApiErrorMessage } from "@/lib/api"
import { Clock, Mail, AlertTriangle, RefreshCw, MessageSquare, Save, Loader2, CheckCircle2 } from "lucide-react"

const TEMPLATE_OPTIONS = [
  { value: "expiration", label: "Expiration Reminder" },
  { value: "renewal", label: "Renewal Confirmation" },
  { value: "disabled", label: "License Disabled" },
  { value: "welcome", label: "Welcome Email" },
]

const updateNumber = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

export default function AutomationPage() {
  const [settings, setSettings] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saveMessage, setSaveMessage] = useState(null)

  const selectedTemplate = settings?.emailTemplates?.selectedTemplate || "expiration"
  const template = useMemo(() => {
    return settings?.emailTemplates?.templates?.[selectedTemplate] || { subject: "", body: "" }
  }, [selectedTemplate, settings])

  const fetchSettings = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data } = await automationApi.get()
      setSettings(data.settings)
      setUpdatedAt(data.updated_at)
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load automation settings"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const patchSection = (section, patch) => {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        ...patch,
      },
    }))
    setSaveMessage(null)
  }

  const updateReminder = (id, patch) => {
    setSettings((current) => ({
      ...current,
      expirationReminders: {
        ...current.expirationReminders,
        schedule: current.expirationReminders.schedule.map((reminder) =>
          reminder.id === id ? { ...reminder, ...patch } : reminder,
        ),
      },
    }))
    setSaveMessage(null)
  }

  const patchEmailTemplates = (patch) => {
    setSettings((current) => ({
      ...current,
      emailTemplates: {
        ...current.emailTemplates,
        ...patch,
      },
    }))
    setSaveMessage(null)
  }

  const updateSelectedTemplate = (patch) => {
    setSettings((current) => ({
      ...current,
      emailTemplates: {
        ...current.emailTemplates,
        templates: {
          ...current.emailTemplates.templates,
          [selectedTemplate]: {
            ...current.emailTemplates.templates[selectedTemplate],
            ...patch,
          },
        },
      },
    }))
    setSaveMessage(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaveMessage(null)

    try {
      const { data } = await automationApi.update(settings)
      setSettings(data.settings)
      setUpdatedAt(data.updated_at)
      setSaveMessage(data.message || "Automation rules saved successfully")
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to save automation settings"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="Automation Rules" subtitle="Configure automated actions and notifications" />
        <div className="p-6">
          <LoadingState message="Loading automation settings..." />
        </div>
      </div>
    )
  }

  if (error && !settings) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="Automation Rules" subtitle="Configure automated actions and notifications" />
        <div className="p-6">
          <ErrorState message={error} onRetry={fetchSettings} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Automation Rules" subtitle="Configure automated actions and notifications" />

      <div className="p-6 space-y-6">
        {(error || saveMessage) && (
          <div
            className={[
              "flex items-center gap-3 rounded-lg border p-4 text-sm",
              error
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : "border-success/40 bg-success/10 text-success",
            ].join(" ")}
          >
            {error ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            <span>{error || saveMessage}</span>
          </div>
        )}

        <Card className="glass border-border">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <CardTitle className="text-foreground">Expiration Reminders</CardTitle>
                  <CardDescription>Send reminders before licenses expire</CardDescription>
                </div>
              </div>
              <Switch
                checked={settings.expirationReminders.enabled}
                onCheckedChange={(enabled) => patchSection("expirationReminders", { enabled })}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <Label>Days before expiration</Label>
                <span className="text-sm font-mono text-primary">{settings.expirationReminders.daysBefore} days</span>
              </div>
              <Slider
                value={[settings.expirationReminders.daysBefore]}
                onValueChange={([daysBefore]) => patchSection("expirationReminders", { daysBefore })}
                max={90}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {settings.expirationReminders.schedule.map((item) => (
                <div key={item.id} className="p-4 rounded-lg bg-secondary/30 border border-border">
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(event) => updateReminder(item.id, { enabled: event.target.checked })}
                      className="rounded border-border text-primary"
                    />
                    {item.label}
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={item.days}
                    onChange={(event) => updateReminder(item.id, { days: updateNumber(event.target.value, item.days) })}
                    className="mt-2 bg-input border-border"
                  />
                  <span className="text-xs text-muted-foreground">days before</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-foreground">Auto-Disable Rules</CardTitle>
                  <CardDescription>Automatically disable licenses based on conditions</CardDescription>
                </div>
              </div>
              <Switch
                checked={settings.autoDisable.enabled}
                onCheckedChange={(enabled) => patchSection("autoDisable", { enabled })}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <Label>Disable on expiration</Label>
                  <Switch
                    checked={settings.autoDisable.disableOnExpiration}
                    onCheckedChange={(disableOnExpiration) => patchSection("autoDisable", { disableOnExpiration })}
                  />
                </div>
                <p className="text-sm text-muted-foreground">Automatically disable licenses when they expire</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                <div className="flex items-center justify-between mb-3 gap-3">
                  <Label>Grace period</Label>
                  <Select
                    value={String(settings.autoDisable.gracePeriodDays)}
                    onValueChange={(value) => patchSection("autoDisable", { gracePeriodDays: Number(value) })}
                  >
                    <SelectTrigger className="w-28 bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-border">
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-muted-foreground">Allow usage after expiration before disabling</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-foreground">Renewal Automation</CardTitle>
                  <CardDescription>Automatically renew eligible licenses</CardDescription>
                </div>
              </div>
              <Switch checked={settings.renewal.enabled} onCheckedChange={(enabled) => patchSection("renewal", { enabled })} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Auto-renew when</Label>
                <Select
                  value={String(settings.renewal.renewDaysBefore)}
                  onValueChange={(value) => patchSection("renewal", { renewDaysBefore: Number(value) })}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-border">
                    <SelectItem value="1">1 day before expiration</SelectItem>
                    <SelectItem value="7">7 days before expiration</SelectItem>
                    <SelectItem value="14">14 days before expiration</SelectItem>
                    <SelectItem value="30">30 days before expiration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Apply to</Label>
                <Select value={settings.renewal.applyTo} onValueChange={(applyTo) => patchSection("renewal", { applyTo })}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-border">
                    <SelectItem value="all">All license types</SelectItem>
                    <SelectItem value="subscription">Subscription only</SelectItem>
                    <SelectItem value="annual">Annual only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-foreground">Email Templates</CardTitle>
                <CardDescription>Customize automated email messages</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Template Type</Label>
              <Select value={selectedTemplate} onValueChange={(selectedTemplate) => patchEmailTemplates({ selectedTemplate })}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-strong border-border">
                  {TEMPLATE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject Line</Label>
              <Input
                value={template.subject}
                onChange={(event) => updateSelectedTemplate({ subject: event.target.value })}
                className="bg-input border-border font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Email Body</Label>
              <Textarea
                rows={6}
                className="bg-input border-border font-mono"
                value={template.body}
                onChange={(event) => updateSelectedTemplate({ body: event.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              <span>
                Available variables: {" "}
                {`{{customer_name}}, {{product_name}}, {{license_id}}, {{license_key}}, {{expiration_date}}, {{days}}`}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse items-stretch justify-between gap-3 md:flex-row md:items-center">
          <p className="text-sm text-muted-foreground">
            {updatedAt ? `Last saved ${new Date(updatedAt).toLocaleString()}` : "Automation settings are not saved yet"}
          </p>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground glow-blue"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {saving ? "Saving..." : "Save Automation Rules"}
          </Button>
        </div>
      </div>
    </div>
  )
}
