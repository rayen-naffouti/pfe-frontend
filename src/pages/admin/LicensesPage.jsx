"use client"

import { useEffect, useMemo, useState } from "react"
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
import { EmptyState, ErrorState, LoadingState } from "@/components/DataState"
import { Search, Filter, Plus, MoreHorizontal, Eye, Edit, Trash2, RefreshCw, Download, Copy } from "lucide-react"
import { getApiErrorMessage, licensesApi } from "@/lib/api"
import { formatDate, getLicenseStatus } from "@/lib/formatters"

export default function LicensesPage() {
  const [licenses, setLicenses] = useState([])
  const [selectedLicenses, setSelectedLicenses] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [productFilter, setProductFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLicenses = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data } = await licensesApi.list()
      setLicenses(data)
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load licenses"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLicenses()
  }, [])

  const productOptions = useMemo(() => {
    return [...new Set(licenses.map((license) => license.product_name).filter(Boolean))]
  }, [licenses])

  const filteredLicenses = useMemo(() => {
    const query = searchQuery.toLowerCase()

    return licenses.filter((license) => {
      const status = getLicenseStatus(license)
      const matchesSearch =
        !query ||
        license.license_key?.toLowerCase().includes(query) ||
        String(license.id).includes(query) ||
        license.customer_username?.toLowerCase().includes(query) ||
        license.customer_email?.toLowerCase().includes(query) ||
        license.product_name?.toLowerCase().includes(query)
      const matchesStatus = statusFilter === "all" || status === statusFilter
      const matchesProduct = productFilter === "all" || license.product_name === productFilter

      return matchesSearch && matchesStatus && matchesProduct
    })
  }, [licenses, productFilter, searchQuery, statusFilter])

  const toggleSelectAll = () => {
    if (selectedLicenses.length === filteredLicenses.length) {
      setSelectedLicenses([])
    } else {
      setSelectedLicenses(filteredLicenses.map((license) => String(license.id)))
    }
  }

  const toggleSelect = (id) => {
    const licenseId = String(id)

    if (selectedLicenses.includes(licenseId)) {
      setSelectedLicenses(selectedLicenses.filter((selectedId) => selectedId !== licenseId))
    } else {
      setSelectedLicenses([...selectedLicenses, licenseId])
    }
  }

  const copyLicenseKey = async (licenseKey) => {
    if (!licenseKey) {
      return
    }

    await navigator.clipboard.writeText(licenseKey)
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
                  <Input
                    placeholder="Search licenses..."
                    className="pl-9 w-64 bg-input border-border"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 bg-input border-border">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-border">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="valid">Valid</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="expiring">Expiring Soon</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={productFilter} onValueChange={setProductFilter}>
                  <SelectTrigger className="w-40 bg-input border-border">
                    <SelectValue placeholder="Product" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-border">
                    <SelectItem value="all">All Products</SelectItem>
                    {productOptions.map((productName) => (
                      <SelectItem key={productName} value={productName}>
                        {productName}
                      </SelectItem>
                    ))}
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

        {loading && <LoadingState message="Loading licenses..." />}

        {error && !loading && <ErrorState message={error} onRetry={fetchLicenses} />}

        {!loading && !error && filteredLicenses.length === 0 && (
          <EmptyState message="No licenses found" />
        )}

        {!loading && !error && filteredLicenses.length > 0 && (
        <Card className="glass border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedLicenses.length === filteredLicenses.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-muted-foreground">License ID</TableHead>
                <TableHead className="text-muted-foreground">Customer</TableHead>
                <TableHead className="text-muted-foreground">Product</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Expiration</TableHead>
                <TableHead className="text-muted-foreground">Created</TableHead>
                <TableHead className="text-muted-foreground w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLicenses.map((license) => (
                <TableRow
                  key={license.id}
                  className="border-border hover:bg-secondary/30 transition-colors cursor-pointer group"
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedLicenses.includes(String(license.id))}
                      onCheckedChange={() => toggleSelect(license.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-primary max-w-48 truncate">
                        {license.license_key || `#${license.id}`}
                      </code>
                      <button
                        type="button"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyLicenseKey(license.license_key)}
                      >
                        <Copy className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{license.customer_username || "N/A"}</TableCell>
                  <TableCell className="text-muted-foreground">{license.product_name || "N/A"}</TableCell>
                  <TableCell>
                    <StatusBadge status={getLicenseStatus(license)} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(license.expiration_at)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(license.created_at)}</TableCell>
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
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredLicenses.length} of {licenses.length} licenses
          </p>
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
