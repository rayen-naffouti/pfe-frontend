"use client"

import { useState } from "react"
import { AdminHeader } from "@/components/AdminHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Package, Copy, Eye, Shield } from "lucide-react"

const initialProducts = [
  {
    id: "PROD-001",
    name: "Enterprise Suite",
    description: "Full-featured enterprise solution with unlimited users",
    category: "Enterprise",
    price: "$999/mo",
    licenses: 156,
    status: "active",
    createdAt: "2023-06-15",
  },
  {
    id: "PROD-002",
    name: "Professional",
    description: "Advanced features for growing teams",
    category: "Business",
    price: "$299/mo",
    licenses: 423,
    status: "active",
    createdAt: "2023-08-22",
  },
  {
    id: "PROD-003",
    name: "Standard",
    description: "Essential features for small businesses",
    category: "Starter",
    price: "$99/mo",
    licenses: 892,
    status: "active",
    createdAt: "2023-04-10",
  },
  {
    id: "PROD-004",
    name: "Developer Kit",
    description: "API access and development tools",
    category: "Developer",
    price: "$49/mo",
    licenses: 234,
    status: "active",
    createdAt: "2023-09-05",
  },
  {
    id: "PROD-005",
    name: "Legacy Suite",
    description: "Previous generation enterprise solution",
    category: "Enterprise",
    price: "$599/mo",
    licenses: 45,
    status: "deprecated",
    createdAt: "2021-01-12",
  },
]

export default function ProductsPage() {
  const [products, setProducts] = useState(initialProducts)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    status: "active",
    trialEnabled: false,
    trialDays: 14,
  })

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id))
    }
  }

  const toggleSelect = (id) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter((p) => p !== id))
    } else {
      setSelectedProducts([...selectedProducts, id])
    }
  }

  const handleAddProduct = () => {
    const product = {
      id: `PROD-${String(products.length + 1).padStart(3, "0")}`,
      name: newProduct.name,
      description: newProduct.description,
      category: newProduct.category,
      price: newProduct.price,
      licenses: 0,
      status: newProduct.status,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setProducts([product, ...products])
    setNewProduct({
      name: "",
      description: "",
      category: "",
      price: "",
      status: "active",
      trialEnabled: false,
      trialDays: 14,
    })
    setIsDialogOpen(false)
  }

  const handleDeleteProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id))
    setSelectedProducts(selectedProducts.filter((p) => p !== id))
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Product Management" subtitle="Manage your software products and licensing tiers" />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <p className="text-2xl font-bold text-foreground">
                    {products.filter((p) => p.status === "active").length}
                  </p>
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
                    {products.reduce((acc, p) => acc + p.licenses, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Licenses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Package className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {products.filter((p) => p.status === "deprecated").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Deprecated</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="glass border-border">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-9 w-64 bg-input border-border"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-40 bg-input border-border">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-border">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-40 bg-input border-border">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-border">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="deprecated">Deprecated</SelectItem>
                  </SelectContent>
                </Select>
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
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground">
                        Product Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="Enter product name"
                        className="bg-input border-border"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
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
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-foreground">
                          Category
                        </Label>
                        <Select
                          value={newProduct.category}
                          onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                        >
                          <SelectTrigger className="bg-input border-border">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="glass-strong border-border">
                            <SelectItem value="Enterprise">Enterprise</SelectItem>
                            <SelectItem value="Business">Business</SelectItem>
                            <SelectItem value="Starter">Starter</SelectItem>
                            <SelectItem value="Developer">Developer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-foreground">
                          Price
                        </Label>
                        <Input
                          id="price"
                          placeholder="$99/mo"
                          className="bg-input border-border"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                      <div>
                        <p className="text-sm font-medium text-foreground">Enable Trial Period</p>
                        <p className="text-xs text-muted-foreground">Allow customers to try before buying</p>
                      </div>
                      <Switch
                        checked={newProduct.trialEnabled}
                        onCheckedChange={(checked) => setNewProduct({ ...newProduct, trialEnabled: checked })}
                      />
                    </div>
                    {newProduct.trialEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="trialDays" className="text-foreground">
                          Trial Duration (days)
                        </Label>
                        <Input
                          id="trialDays"
                          type="number"
                          className="bg-input border-border"
                          value={newProduct.trialDays}
                          onChange={(e) => setNewProduct({ ...newProduct, trialDays: Number.parseInt(e.target.value) })}
                        />
                      </div>
                    )}
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-blue"
                      onClick={handleAddProduct}
                      disabled={!newProduct.name || !newProduct.category || !newProduct.price}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Product
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <Card className="glass border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{selectedProducts.length} product(s) selected</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive/50 text-destructive hover:bg-destructive/10 bg-transparent"
                    onClick={() => {
                      setProducts(products.filter((p) => !selectedProducts.includes(p.id)))
                      setSelectedProducts([])
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Table */}
        <Card className="glass border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-muted-foreground">Product ID</TableHead>
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Category</TableHead>
                <TableHead className="text-muted-foreground">Price</TableHead>
                <TableHead className="text-muted-foreground">Licenses</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Created</TableHead>
                <TableHead className="text-muted-foreground w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow
                  key={product.id}
                  className="border-border hover:bg-secondary/30 transition-colors cursor-pointer group"
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => toggleSelect(product.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <code className="text-sm font-mono text-primary">{product.id}</code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-xs">{product.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-secondary/50 text-muted-foreground">
                      {product.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-foreground font-medium">{product.price}</TableCell>
                  <TableCell className="text-muted-foreground">{product.licenses.toLocaleString()}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === "active"
                          ? "bg-green-500/10 text-green-400 border border-green-500/30"
                          : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                      }`}
                    >
                      {product.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{product.createdAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-strong border-border">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteProduct(product.id)}>
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

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-border bg-transparent" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="border-border bg-primary/10 text-primary">
              1
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
