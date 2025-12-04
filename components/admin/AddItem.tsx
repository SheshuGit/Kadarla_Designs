import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Package, DollarSign, FileText, Loader2, CheckCircle, Percent } from 'lucide-react';
import { itemsAPI } from '../../utils/api';

const AddItem: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    description: '',
    stock: '',
    discount: '',
    image: null as File | null,
    imagePreview: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const categories = [
    'Birthday',
    'Anniversary',
    'Wedding',
    'Corporate',
    'Best Sellers',
    'Custom',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null,
      imagePreview: '',
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Product title is required';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a valid positive number';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.stock.trim()) {
      newErrors.stock = 'Stock quantity is required';
    } else if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      newErrors.stock = 'Stock must be a valid non-negative number';
    }

    if (formData.discount.trim()) {
      const discountValue = Number(formData.discount);
      if (isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
        newErrors.discount = 'Discount must be between 0 and 100';
      }
    }

    if (!formData.image) {
      newErrors.image = 'Product image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Convert image file to base64
  const convertImageToBase64 = (file: File): Promise<{ base64: string; type: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        console.log('📸 FileReader result preview:', result.substring(0, 50) + '...');
        
        // Remove data:image/...;base64, prefix if present
        let base64 = result;
        if (result.includes(',')) {
          base64 = result.split(',')[1]; // Get only the base64 part after the comma
        }
        
        console.log('📸 Extracted base64 length:', base64.length);
        console.log('📸 Image type:', file.type);
        
        resolve({ base64, type: file.type });
      };
      reader.onerror = (error) => {
        console.error('❌ FileReader error:', error);
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    
    if (!validateForm()) {
      return;
    }

    if (!formData.image) {
      setErrors({ image: 'Product image is required' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Convert image to base64
      console.log('📸 Converting image to base64...');
      const { base64, type } = await convertImageToBase64(formData.image);
      console.log('✅ Image converted, size:', base64.length, 'bytes');

      console.log('📦 Submitting item to API...');
      await itemsAPI.addItem(
        formData.title,
        Number(formData.price),
        formData.category,
        formData.description,
        Number(formData.stock),
        base64,
        type,
        formData.discount ? Number(formData.discount) : 0
      );

      console.log('✅ Item added successfully!');
      setSuccessMessage('Product added successfully!');

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          title: '',
          price: '',
          category: '',
          description: '',
          stock: '',
          discount: '',
          image: null,
          imagePreview: '',
        });
        setSuccessMessage('');
      }, 2000);
    } catch (error) {
      console.error('❌ Error adding item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add product. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-emerald-900 mb-2">
          Add New Item
        </h1>
        <p className="text-sm sm:text-base text-emerald-600">Add a new product to your inventory</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-emerald-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Image */}
          <div>
            <label className="block text-sm font-semibold text-emerald-900 mb-3">
              <ImageIcon className="inline mr-2" size={18} />
              Product Image
            </label>
            {formData.imagePreview ? (
              <div className="relative">
                <img
                  src={formData.imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl border-2 border-emerald-100"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-emerald-300 rounded-xl cursor-pointer bg-mint-50 hover:bg-emerald-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="text-emerald-400 mb-3" size={40} />
                  <p className="mb-2 text-sm text-emerald-600">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-emerald-500">PNG, JPG, GIF (MAX. 5MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}
            {errors.image && (
              <p className="mt-2 text-sm text-red-600">{errors.image}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-emerald-900 mb-2">
              <Package className="inline mr-2" size={18} />
              Product Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter product title"
              className={`w-full px-4 py-3 bg-mint-50 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.title
                  ? 'border-red-300 focus:ring-red-300 focus:border-red-400'
                  : 'border-emerald-100 focus:ring-emerald-300 focus:border-emerald-400'
              } text-emerald-900`}
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Price and Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-emerald-900 mb-2">
                <DollarSign className="inline mr-2" size={18} />
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={`w-full px-4 py-3 bg-mint-50 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.price
                    ? 'border-red-300 focus:ring-red-300 focus:border-red-400'
                    : 'border-emerald-100 focus:ring-emerald-300 focus:border-emerald-400'
                } text-emerald-900`}
              />
              {errors.price && (
                <p className="mt-2 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-emerald-900 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-mint-50 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.category
                    ? 'border-red-300 focus:ring-red-300 focus:border-red-400'
                    : 'border-emerald-100 focus:ring-emerald-300 focus:border-emerald-400'
                } text-emerald-900 font-medium`}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-2 text-sm text-red-600">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Stock and Discount Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Stock */}
            <div>
              <label className="block text-sm font-semibold text-emerald-900 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className={`w-full px-4 py-3 bg-mint-50 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.stock
                    ? 'border-red-300 focus:ring-red-300 focus:border-red-400'
                    : 'border-emerald-100 focus:ring-emerald-300 focus:border-emerald-400'
                } text-emerald-900`}
              />
              {errors.stock && (
                <p className="mt-2 text-sm text-red-600">{errors.stock}</p>
              )}
            </div>

            {/* Discount */}
            <div>
              <label className="block text-sm font-semibold text-emerald-900 mb-2">
                <Percent className="inline mr-2" size={18} />
                Discount (%)
              </label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                placeholder="0"
                min="0"
                max="100"
                step="0.01"
                className={`w-full px-4 py-3 bg-mint-50 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.discount
                    ? 'border-red-300 focus:ring-red-300 focus:border-red-400'
                    : 'border-emerald-100 focus:ring-emerald-300 focus:border-emerald-400'
                } text-emerald-900`}
              />
              {errors.discount && (
                <p className="mt-2 text-sm text-red-600">{errors.discount}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-emerald-900 mb-2">
              <FileText className="inline mr-2" size={18} />
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description..."
              rows={5}
              className={`w-full px-4 py-3 bg-mint-50 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${
                errors.description
                  ? 'border-red-300 focus:ring-red-300 focus:border-red-400'
                  : 'border-emerald-100 focus:ring-emerald-300 focus:border-emerald-400'
              } text-emerald-900`}
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-emerald-700 font-medium flex items-center gap-2">
              <CheckCircle size={20} />
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 font-medium">
              {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-emerald-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={22} />
                  Adding Product...
                </>
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItem;

