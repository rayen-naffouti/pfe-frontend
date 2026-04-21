"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminHeader } from "@/components/AdminHeader"
import { EmptyState, ErrorState, LoadingState } from "@/components/DataState"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Package, Copy, Shield, Loader2 } from "lucide-react"
import { getApiErrorMessage, productsApi } from "@/lib/api"
import { formatDate, slugify } from "@/lib/formatters"

const initialProductForm = {
  name: "",
  slug: "",
  description: "",
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [newProduct, setNewProduct] = useState(initialProductForm)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data } = await productsApi.list()
      setProducts(data)
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load products"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase()

    return products.filter((product) => {
      return (
        product.name?.toLowerCase().includes(query) ||
        product.slug?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      )
    })
  }, [products, searchQuery])

  const handleNameChange = (value) => {
    setNewProduct((current) => ({
      ...current,
      name: value,
      slug: current.slug ? current.slug : slugify(value),
    }))
  }

  const handleAddProduct = async () => {
    setCreateError(null)

    if (!newProduct.name || !newProduct.slug) {
      setCreateError("Product name and slug are required")
      return
    }

    setCreating(true)

    try {
      const { data } = await productsApi.create(newProduct)
      setProducts((current) => [data.product, ...current])
      setNewProduct(initialProductForm)
      setIsDialogOpen(false)
    } catch (err) {
      setCreateError(getApiErrorMessage(err, "Failed to create product"))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Product Management" subtitle="Manage your software products and licensing tiers" />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{products.length}</p>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{products.length}</p>
                  <p className="text-sm text-muted-foreground">Active Products</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Copy className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {products.reduce((acc, product) => acc + Number(product.license_count || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Licenses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass border-border">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-9 w-64 bg-input border-border"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground glow-blue">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-strong border-border sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-foreground flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      Add New Product
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {createError && (
                      <div className="p-3 rounded-lg text-red-400 border border-red-500/30 bg-red-500/10 text-sm">
                        {createError}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground">
                        Product Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="Enter product name"
                        className="bg-input border-border"
                        value={newProduct.name}
                        onChange={(event) => handleNameChange(event.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug" className="text-foreground">
                        Slug
                      </Label>
                      <Input
                        id="slug"
                        placeholder="product-slug"
                        className="bg-input border-border"
                        value={newProduct.slug}
                        onChange={(event) => setNewProduct({ ...newProduct, slug: slugify(event.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-foreground">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Enter product description"
                        className="bg-input border-border resize-none"
                        rows={3}
                        value={newProduct.description}
                        onChange={(event) => setNewProduct({ ...newProduct, description: event.target.value })}
                      />
                    </div>

                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-blue"
                      onClick={handleAddProduct}
                      disabled={creating || !newProduct.name || !newProduct.slug}
                    >
                      {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                      {creating ? "Creating..." : "Create Product"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {loading && <LoadingState message="Loading products..." />}

        {error && !loading && <ErrorState message={error} onRetry={fetchProducts} />}

        {!loading && !error && filteredProducts.length === 0 && <EmptyState message="No products found" />}

        {!loading && !error && filteredProducts.length > 0 && (
          <Card className="glass border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Product ID</TableHead>
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">Slug</TableHead>
                  <TableHead className="text-muted-foreground">Licenses</TableHead>
                  <TableHead className="text-muted-foreground">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="border-border hover:bg-secondary/30 transition-colors">
                    <TableCell>
                      <code className="text-sm font-mono text-primary">#{product.id}</code>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-xs">{product.description || "No description"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm text-muted-foreground">{product.slug}</code>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {Number(product.license_count || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(product.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        <p className="text-sm text-muted-foreground">
          Showing {filteredProducts.length} of {products.length} products
        </p>
      </div>
    </div>
  )
}
