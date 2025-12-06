import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit, Trash2, Eye, Package, Plus, Loader2, X, Percent } from 'lucide-react';
import { itemsAPI, Item } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { PLACEHOLDER_IMAGE } from '../../utils/constants';

const Items: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [discountItem, setDiscountItem] = useState<Item | null>(null);
  const [discountValue, setDiscountValue] = useState('');
  const [discountTitle, setDiscountTitle] = useState('');
  const [discountStartDate, setDiscountStartDate] = useState('');
  const [discountEndDate, setDiscountEndDate] = useState('');
  const navigate = useNavigate();

  const categories = ['All', 'Birthday', 'Anniversary', 'Wedding', 'Corporate', 'Best Sellers', 'Custom'];

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, filterCategory, filterStatus]);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const allItems = await itemsAPI.getItems();
      setItems(allItems);
      setFilteredItems(allItems);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...items];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    // Status filter
    if (filterStatus !== 'all') {
      const isActive = filterStatus === 'active';
      filtered = filtered.filter(item => item.isActive === isActive);
    }

    setFilteredItems(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await itemsAPI.deleteItem(id);
      await fetchItems(); // Refresh the list
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const handleToggleStatus = async (item: Item) => {
    try {
      await itemsAPI.updateItem(item.id, { isActive: !item.isActive });
      await fetchItems(); // Refresh the list
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item. Please try again.');
    }
  };

  // Helper function to format date for input
  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Helper function to check if discount is currently active
  const isDiscountActive = (item: Item): boolean => {
    if (!item.discount || item.discount <= 0) return false;
    if (!item.discountStartDate || !item.discountEndDate) return true; // If no dates, always active
    
    const now = new Date();
    const startDate = new Date(item.discountStartDate);
    const endDate = new Date(item.discountEndDate);
    
    return now >= startDate && now <= endDate;
  };

  const handleDiscountClick = (item: Item) => {
    setDiscountItem(item);
    setDiscountValue(item.discount?.toString() || '0');
    setDiscountTitle(item.discountTitle || '');
    setDiscountStartDate(formatDateForInput(item.discountStartDate));
    setDiscountEndDate(formatDateForInput(item.discountEndDate));
  };

  const handleDiscountSave = async () => {
    if (!discountItem) return;
    
    const discount = Number(discountValue);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      alert('Discount must be between 0 and 100');
      return;
    }

    if (discountStartDate && discountEndDate) {
      const start = new Date(discountStartDate);
      const end = new Date(discountEndDate);
      if (start >= end) {
        alert('End date must be after start date');
        return;
      }
    }

    try {
      await itemsAPI.updateItem(discountItem.id, { 
        discount,
        discountTitle: discountTitle.trim() || undefined,
        discountStartDate: discountStartDate || undefined,
        discountEndDate: discountEndDate || undefined
      });
      await fetchItems(); // Refresh the list
      setDiscountItem(null);
      setDiscountValue('');
      setDiscountTitle('');
      setDiscountStartDate('');
      setDiscountEndDate('');
    } catch (error) {
      console.error('Error updating discount:', error);
      alert('Failed to update discount. Please try again.');
    }
  };

  // Convert base64 to data URL
  const getImageSrc = (image: string, imageType?: string) => {
    if (!image) return PLACEHOLDER_IMAGE;
    if (image.startsWith('data:') || image.startsWith('http') || (image.startsWith('/') && image.length < 200)) {
      return image;
    }
    const cleanBase64 = image.includes(',') ? image.split(',')[1] : image;
    return `data:${imageType || 'image/jpeg'};base64,${cleanBase64}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-emerald-900 mb-2">
            All Items
          </h1>
          <p className="text-sm sm:text-base text-emerald-600">Manage your product inventory</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              // Open discount modal for bulk or show instructions
              alert('Click the discount icon on any item card to set its discount');
            }}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Percent size={18} />
            <span className="hidden sm:inline">Manage Discounts</span>
            <span className="sm:hidden">Discounts</span>
          </button>
          <button
            onClick={() => navigate('/admin/add-item')}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add New Item</span>
            <span className="sm:hidden">Add Item</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-emerald-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400" size={20} />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-mint-50 border-2 border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 text-emerald-900"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400" size={20} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-12 pr-8 py-3 bg-mint-50 border-2 border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 text-emerald-900 font-medium appearance-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat === 'All' ? 'all' : cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Package className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400" size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-12 pr-8 py-3 bg-mint-50 border-2 border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 text-emerald-900 font-medium appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md border border-emerald-100">
          <p className="text-xs sm:text-sm text-emerald-600 mb-1">Total Items</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-900">{items.length}</p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md border border-emerald-100">
          <p className="text-xs sm:text-sm text-emerald-600 mb-1">Active Items</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-900">{items.filter(i => i.isActive).length}</p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md border border-emerald-100">
          <p className="text-xs sm:text-sm text-emerald-600 mb-1">Inactive Items</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-900">{items.filter(i => !i.isActive).length}</p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md border border-emerald-100">
          <p className="text-xs sm:text-sm text-emerald-600 mb-1">Filtered Results</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-900">{filteredItems.length}</p>
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-emerald-100">
          <Package className="mx-auto text-emerald-300 mb-4" size={48} />
          <p className="text-emerald-600 text-lg">No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-emerald-100 overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <img
                  src={getImageSrc(item.image, item.imageType)}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                  }}
                />
                <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium ${
                  item.isActive
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              {/* Content */}
              <div className="p-3 sm:p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base sm:text-lg font-bold text-emerald-900 line-clamp-2 flex-1">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-emerald-600 mb-2 sm:mb-3 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                  <div className="flex-1">
                    {item.discount && item.discount > 0 && isDiscountActive(item) ? (
                      <div>
                        <p className="text-sm sm:text-lg text-gray-500 line-through">₹{item.price.toLocaleString('en-IN')}</p>
                        <p className="text-xl sm:text-2xl font-bold text-emerald-900">
                          ₹{((item.price * (100 - item.discount)) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </p>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                          <span className="text-xs text-red-600 font-semibold">{item.discount}% OFF</span>
                          {item.discountTitle && (
                            <span className="text-xs text-purple-600 font-medium">• {item.discountTitle}</span>
                          )}
                        </div>
                        {item.discountStartDate && item.discountEndDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(item.discountStartDate).toLocaleDateString()} - {new Date(item.discountEndDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-xl sm:text-2xl font-bold text-emerald-900">₹{item.price.toLocaleString('en-IN')}</p>
                        {item.discount && item.discount > 0 && !isDiscountActive(item) && (
                          <p className="text-xs text-gray-500 mt-1">Discount expired</p>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-emerald-600 mt-1">Stock: {item.stock}</p>
                  </div>
                  <span className="px-2 sm:px-3 py-1 bg-mint-50 text-emerald-700 rounded-lg text-xs sm:text-sm font-medium self-start">
                    {item.category}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 pt-3 sm:pt-4 border-t border-emerald-100">
                  <button
                    onClick={() => handleToggleStatus(item)}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      item.isActive
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    <span className="hidden sm:inline">{item.isActive ? 'Deactivate' : 'Activate'}</span>
                    <span className="sm:hidden">{item.isActive ? 'Off' : 'On'}</span>
                  </button>
                  <button
                    onClick={() => handleDiscountClick(item)}
                    className="p-1.5 sm:p-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                    title="Set Discount"
                  >
                    <Percent size={16} />
                  </button>
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="p-1.5 sm:p-2 bg-mint-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => navigate(`/admin/edit-item/${item.id}`)}
                    className="p-1.5 sm:p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 sm:p-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Discount Modal */}
      {discountItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-serif font-bold text-emerald-900">Set Discount</h2>
              <button
                onClick={() => {
                  setDiscountItem(null);
                  setDiscountValue('');
                  setDiscountTitle('');
                  setDiscountStartDate('');
                  setDiscountEndDate('');
                }}
                className="p-2 rounded-full hover:bg-emerald-50 text-emerald-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <p className="text-sm text-emerald-600 mb-2">Item: <span className="font-semibold text-emerald-900">{discountItem.title}</span></p>
                <p className="text-sm text-emerald-600 mb-4">Current Price: <span className="font-semibold text-emerald-900">₹{discountItem.price.toLocaleString('en-IN')}</span></p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-emerald-900 mb-2">
                  Discount Title (Optional)
                </label>
                <input
                  type="text"
                  value={discountTitle}
                  onChange={(e) => setDiscountTitle(e.target.value)}
                  placeholder="e.g., Summer Sale, Flash Sale"
                  maxLength={100}
                  className="w-full px-4 py-3 bg-mint-50 border-2 border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 text-emerald-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-emerald-900 mb-2">
                  Discount Percentage (%)
                </label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-4 py-3 bg-mint-50 border-2 border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 text-emerald-900"
                />
                {discountValue && !isNaN(Number(discountValue)) && Number(discountValue) > 0 && (
                  <p className="mt-2 text-sm text-emerald-600">
                    Discounted Price: <span className="font-bold text-emerald-900">
                      ₹{((discountItem.price * (100 - Number(discountValue))) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-2">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={discountStartDate}
                    onChange={(e) => setDiscountStartDate(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-mint-50 border-2 border-emerald-100 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 text-emerald-900 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={discountEndDate}
                    onChange={(e) => setDiscountEndDate(e.target.value)}
                    min={discountStartDate || undefined}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-mint-50 border-2 border-emerald-100 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 text-emerald-900 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                <button
                  onClick={handleDiscountSave}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all"
                >
                  Save Discount
                </button>
                <button
                  onClick={() => {
                    setDiscountItem(null);
                    setDiscountValue('');
                    setDiscountTitle('');
                    setDiscountStartDate('');
                    setDiscountEndDate('');
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-serif font-bold text-emerald-900">Item Details</h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-full hover:bg-emerald-50 text-emerald-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <img
                  src={getImageSrc(selectedItem.image, selectedItem.imageType)}
                  alt={selectedItem.title}
                  className="w-full h-64 object-cover rounded-xl"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-emerald-900 mb-2">{selectedItem.title}</h3>
                <p className="text-emerald-600 mb-4">{selectedItem.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-emerald-600">Price</p>
                    {selectedItem.discount && selectedItem.discount > 0 && isDiscountActive(selectedItem) ? (
                      <div>
                        <p className="text-sm text-gray-500 line-through">₹{selectedItem.price.toLocaleString('en-IN')}</p>
                        <p className="text-lg font-bold text-emerald-900">
                          ₹{((selectedItem.price * (100 - selectedItem.discount)) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-red-600 font-semibold">{selectedItem.discount}% OFF</p>
                        {selectedItem.discountTitle && (
                          <p className="text-xs text-purple-600 font-medium mt-1">{selectedItem.discountTitle}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-lg font-bold text-emerald-900">₹{selectedItem.price.toLocaleString('en-IN')}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-emerald-600">Stock</p>
                    <p className="text-lg font-bold text-emerald-900">{selectedItem.stock}</p>
                  </div>
                  <div>
                    <p className="text-sm text-emerald-600">Category</p>
                    <p className="text-lg font-semibold text-emerald-900">{selectedItem.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-emerald-600">Status</p>
                    <p className={`text-lg font-semibold ${selectedItem.isActive ? 'text-emerald-700' : 'text-gray-600'}`}>
                      {selectedItem.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  {selectedItem.discount !== undefined && selectedItem.discount > 0 && (
                    <>
                      <div>
                        <p className="text-sm text-emerald-600">Discount</p>
                        <p className="text-lg font-semibold text-emerald-900">{selectedItem.discount}%</p>
                        {selectedItem.discountTitle && (
                          <p className="text-xs text-purple-600">{selectedItem.discountTitle}</p>
                        )}
                      </div>
                      {(selectedItem.discountStartDate || selectedItem.discountEndDate) && (
                        <div>
                          <p className="text-sm text-emerald-600">Discount Period</p>
                          <p className="text-xs text-gray-600">
                            {selectedItem.discountStartDate ? new Date(selectedItem.discountStartDate).toLocaleDateString() : 'No start date'} - {selectedItem.discountEndDate ? new Date(selectedItem.discountEndDate).toLocaleDateString() : 'No end date'}
                          </p>
                          <p className={`text-xs mt-1 ${isDiscountActive(selectedItem) ? 'text-green-600' : 'text-red-600'}`}>
                            {isDiscountActive(selectedItem) ? 'Active Now' : 'Expired/Not Active'}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;

