import { getAllFoods } from '../../models/foods/food.js';
import { getAdonsByHotelId } from '../../models/foods/adons.js';

async function testFood() {
  const foods = getAllFoods();
  console.log('All foods:', foods);
}


async function testAdons() {
  const adons = getAdonsByHotelId(1);
  console.log('Adons for hotel 1:', adons);
}
testAdons();
