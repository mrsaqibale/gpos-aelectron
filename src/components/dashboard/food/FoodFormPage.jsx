import { useNavigate, useParams } from 'react-router-dom';
import FoodForm from './FoodForm';

// Mock function to get food by ID - replace with your actual data source
const mockFoodItems = [
  { id: 1, name: 'Chicken Biryani', price: 14.95, category: 'Main Course' },
  { id: 2, name: 'Zinger Burger', price: 8.5, category: 'Burgers' },
  // Add more mock items as needed
];

const FoodFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  // Implement getFoodById function
  const getFoodById = (foodId) => {
    return mockFoodItems.find(item => item.id === parseInt(foodId));
  };

  const handleSubmit = (formData) => {
    // Handle form submission
    console.log('Form submitted:', formData);
    navigate('/dashboard/food-management'); // Redirect back to food list
  };

  return (
    <div className="container mx-auto p-4">
      {/* <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Food Item' : 'Add New Food Item'}
      </h1> */}
      
      <FoodForm 
        food={isEditing ? getFoodById(id) : null}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/dashboard/food-management')}
      />
    </div>
  );
};

export default FoodFormPage;