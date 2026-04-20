"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { AdminHeader } from "@/components/AdminHeader"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Filter, Plus, MoreHorizontal, Eye, Edit, Trash2, RefreshCw, Download, Copy } from "lucide-react"

const licenses = [
  {
    id: "LIC-2024-001",
    customer: "Acme Corporation",
    product: "Enterprise Suite",
    type: "Perpetual",
    status: "valid",
    expiration: "2025-12-31",
    activations: "5/10",
  },
  {
    id: "LIC-2024-002",
    customer: "TechStart Inc.",
    product: "Professional",
    type: "Trial",
    status: "trial",
    expiration: "2024-02-15",
    activations: "2/3",
  },
  {
    id: "LIC-2024-003",
    customer: "GlobalTech Ltd.",
    product: "Enterprise Suite",
    type: "Subscription",
    status: "expiring",
    expiration: "2024-01-20",
    activations: "28/30",
  },
  {
    id: "LIC-2024-004",
    customer: "InnovateCo",
    product: "Standard",
    type: "Annual",
    status: "valid",
    expiration: "2024-08-15",
    activations: "8/10",
  },
  {
    id: "LIC-2024-005",
    customer: "DataFlow Systems",
    product: "Enterprise Suite",
    type: "Subscription",
    status: "expired",
    expiration: "2023-12-01",
    activations: "15/15",
  },
  {
    id: "LIC-2024-006",
    customer: "CloudNine Tech",
    product: "Professional",
    type: "Annual",
    status: "valid",
    expiration: "2024-11-30",
    activations: "12/20",
  },
  {
    id: "LIC-2024-007",
    customer: "StartupHub",
    product: "Standard",
    type: "Trial",
    status: "trial",
    expiration: "2024-01-25",
    activations: "1/3",
  },
  {
    id: "LIC-2024-008",
    customer: "MegaCorp Industries",
    product: "Enterprise Suite",
    type: "Perpetual",
    status: "valid",
    expiration: "Never",
    activations: "45/100",
  },
]

export default function LicensesPage() {
  const [selectedLicenses, setSelectedLicenses] = useState([])

  const toggleSelectAll = () => {
    if (selectedLicenses.length === licenses.length) {
      setSelectedLicenses([])
    } else {
      setSelectedLicenses(licenses.map((l) => l.id))
    }
  }

  const toggleSelect = (id) => {
    if (selectedLicenses.includes(id)) {
      setSelectedLicenses(selectedLicenses.filter((l) => l !== id))
    } else {
      setSelectedLicenses([...selectedLicenses, id])
    }
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="License Management" subtitle="Manage all licenses and subscriptions" />

      <div className="p-6 space-y-6">
        <Card className="glass border-border">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search licenses..." className="pl-9 w-64 bg-input border-border" />
                </div>
                <Select>
                  <SelectTrigger className="w-40 bg-input border-border">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-border">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="valid">Valid</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="expiring">Expiring Soon</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-40 bg-input border-border">
                    <SelectValue placeholder="Product" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-border">
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="enterprise">Enterprise Suite</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="border-border bg-transparent">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground glow-blue">
                <Link to="/admin/licenses/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create License
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {selectedLicenses.length > 0 && (
          <Card className="glass border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{selectedLicenses.length} license(s) selected</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-border bg-transparent">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Renew Selected
                  </Button>
                  <Button variant="outline" size="sm" className="border-border bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive/50 text-destructive hover:bg-destructive/10 bg-transparent"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="glass border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox checked={selectedLicenses.length === licenses.length} onCheckedChange={toggleSelectAll} />
                </TableHead>
                <TableHead className="text-muted-foreground">License ID</TableHead>
                <TableHead className="text-muted-foreground">Customer</TableHead>
                <TableHead className="text-muted-foreground">Product</TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Expiration</TableHead>
                <TableHead className="text-muted-foreground">Activations</TableHead>
                <TableHead className="text-muted-foreground w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenses.map((license) => (
                <TableRow
                  key={license.id}
                  className="border-border hover:bg-secondary/30 transition-colors cursor-pointer group"
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedLicenses.includes(license.id)}
                      onCheckedChange={() => toggleSelect(license.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-primary">{license.id}</code>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Copy className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{license.customer}</TableCell>
                  <TableCell className="text-muted-foreground">{license.product}</TableCell>
                  <TableCell className="text-muted-foreground">{license.type}</TableCell>
                  <TableCell>
                    <StatusBadge status={license.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{license.expiration}</TableCell>
                  <TableCell className="text-muted-foreground">{license.activations}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-strong border-border">
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/licenses/${license.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Renew
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Showing 1-8 of 847 licenses</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-border bg-transparent" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="border-border bg-primary/10 text-primary">
              1
            </Button>
            <Button variant="outline" size="sm" className="border-border bg-transparent">
              2
            </Button>
            <Button variant="outline" size="sm" className="border-border bg-transparent">
              3
            </Button>
            <Button variant="outline" size="sm" className="border-border bg-transparent">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
