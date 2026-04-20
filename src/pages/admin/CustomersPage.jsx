"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { AdminHeader } from "@/components/AdminHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter, User, Key, Mail, Calendar } from "lucide-react"
import api from "../../lib/axios"

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get("/customers")
        setCustomers(res.data)
      } catch (err) {
        console.error(err)
        setError("Failed to load customers")
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen">
      <AdminHeader title="Customer Management" subtitle="Manage all customers and their licenses" />

      <div className="p-6 space-y-6">
        {/* Search + Filters */}
        <Card className="glass border-border">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search customers..." className="pl-9 w-64 bg-input border-border" />
                </div>
                <Button variant="outline" className="border-border bg-transparent">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
              <Link to={`/register`}>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground glow-blue flex cursor-pointer">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Loading state */}
        {loading && (
          <p className="text-center text-muted-foreground">Loading customers...</p>
        )}

        {/* Error state */}
        {error && (
          <p className="text-center text-destructive">{error}</p>
        )}

        {/* Customer Table */}
        {!loading && !error && (
          <Card className="glass border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Customer</TableHead>
                  <TableHead className="text-muted-foreground">Email</TableHead>
                  <TableHead className="text-muted-foreground">Licenses</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Joinet At</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {customers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="border-border hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                          {customer.username?.toUpperCase()?.charAt(0)}
                        </div>
                        <span className="font-medium text-foreground">{customer.username}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-muted-foreground">{customer.email}</TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
                        {customer.license_count ?? 0} licenses
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-success/10 text-success border-success/30"
                      >
                        active
                      </Badge>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {formatDate(customer.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Customer Drawer */}
        <Sheet open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <SheetContent className="glass-strong border-border w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle className="text-foreground">Customer Details</SheetTitle>
            </SheetHeader>

            {selectedCustomer && (
              <div className="mt-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                    {selectedCustomer.username?.toUpperCase()?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{selectedCustomer?.username}</h3>
                    <p className="text-sm text-muted-foreground">{selectedCustomer?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Key className="w-4 h-4" />
                      <span className="text-sm">Licenses</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {selectedCustomer?.license_count ?? 0}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Joined</span>
                    </div>
                    <p className="text-lg font-medium text-foreground">
                      {formatDate(selectedCustomer.created_at)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link to={`/admin/customers/${selectedCustomer.id}`}>
                      <User className="w-4 h-4 mr-2" />
                      View Full Profile
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full border-border bg-transparent">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
