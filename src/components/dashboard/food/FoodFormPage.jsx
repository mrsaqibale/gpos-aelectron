import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import FoodForm from './FoodForm';

const FoodFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch food data when editing
  useEffect(() => {
    if (isEditing && id) {
      const fetchFoodData = async () => {
        try {
          setLoading(true);
          console.log('Fetching food data for ID:', id);
          const result = await window.myAPI?.getFoodById(parseInt(id));
          
          if (result && result.success) {
            console.log('Food data fetched successfully:', result.data);
            console.log('Food data structure:', JSON.stringify(result.data, null, 2));
            setFood(result.data);
          } else {
            console.error('Failed to fetch food data:', result?.message);
            alert('Failed to load food details for editing');
            navigate('/dashboard/food-management');
          }
        } catch (error) {
          console.error('Error fetching food data:', error);
          alert('Error loading food details for editing');
          navigate('/dashboard/food-management');
        } finally {
          setLoading(false);
        }
      };

      fetchFoodData();
    }
  }, [id, isEditing, navigate]);

  const handleSubmit = (formData) => {
    // Handle form submission
    console.log('Form submitted:', formData);
    navigate('/dashboard/food-management'); // Redirect back to food list
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading food details...</div>
        </div>
      </div>
    );
  }

  console.log('FoodFormPage render - isEditing:', isEditing, 'food:', food);
  
  return (
    <div className="container mx-auto p-4">
      <FoodForm 
        food={isEditing ? food : null}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default FoodFormPage;