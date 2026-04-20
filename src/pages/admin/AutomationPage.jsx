"use client"

import { useState } from "react"
import { AdminHeader } from "@/components/AdminHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Mail, AlertTriangle, RefreshCw, MessageSquare, Save } from "lucide-react"

export default function AutomationPage() {
  const [expirationDays, setExpirationDays] = useState([30])

  return (
    <div className="min-h-screen">
      <AdminHeader title="Automation Rules" subtitle="Configure automated actions and notifications" />

      <div className="p-6 space-y-6">
        <Card className="glass border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <CardTitle className="text-foreground">Expiration Reminders</CardTitle>
                  <CardDescription>Send reminders before licenses expire</CardDescription>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Days before expiration</Label>
                <span className="text-sm font-mono text-primary">{expirationDays[0]} days</span>
              </div>
              <Slider
                value={expirationDays}
                onValueChange={setExpirationDays}
                max={90}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "First reminder", value: 30 },
                { label: "Second reminder", value: 14 },
                { label: "Final reminder", value: 3 },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-lg bg-secondary/30 border border-border">
                  <Label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded border-border text-primary" />
                    {item.label}
                  </Label>
                  <Input type="number" defaultValue={item.value} className="mt-2 bg-input border-border" />
                  <span className="text-xs text-muted-foreground">days before</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-foreground">Auto-Disable Rules</CardTitle>
                  <CardDescription>Automatically disable licenses based on conditions</CardDescription>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <Label>Disable on expiration</Label>
                  <Switch defaultChecked />
                </div>
                <p className="text-sm text-muted-foreground">Automatically disable licenses when they expire</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <Label>Grace period</Label>
                  <Select defaultValue="7">
                    <SelectTrigger className="w-24 bg-input border-border">
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-foreground">Renewal Automation</CardTitle>
                  <CardDescription>Automatically renew eligible licenses</CardDescription>
                </div>
              </div>
              <Switch />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Auto-renew when</Label>
                <Select defaultValue="7">
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
                <Select defaultValue="subscription">
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
              <Select defaultValue="expiration">
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-strong border-border">
                  <SelectItem value="expiration">Expiration Reminder</SelectItem>
                  <SelectItem value="renewal">Renewal Confirmation</SelectItem>
                  <SelectItem value="disabled">License Disabled</SelectItem>
                  <SelectItem value="welcome">Welcome Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject Line</Label>
              <Input
                defaultValue="Your license expires in {{days}} days"
                className="bg-input border-border font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Email Body</Label>
              <Textarea
                rows={6}
                className="bg-input border-border font-mono"
                defaultValue={`Dear {{customer_name}},\n\nYour license for {{product_name}} ({{license_id}}) will expire on {{expiration_date}}.\n\nPlease renew your license to continue using our services.\n\nBest regards,\nThe Licentra Team`}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              <span>
                Available variables:{" "}
                {`{{customer_name}}, {{product_name}}, {{license_id}}, {{expiration_date}}, {{days}}`}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground glow-blue">
            <Save className="w-4 h-4 mr-2" />
            Save Automation Rules
          </Button>
        </div>
      </div>
    </div>
  )
}
