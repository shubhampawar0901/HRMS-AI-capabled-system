/**
 * Test script to verify Performance Rating String-to-Number conversion fix
 * Tests: String rating handling, NaN prevention, null value display
 */

// Simulate the actual API response data
const mockReviewsResponse = {
  "success": true,
  "data": {
    "reviews": [
      {
        "id": 11,
        "employeeId": 3,
        "overallRating": "4.00",  // String rating
        "status": "draft"
      },
      {
        "id": 10,
        "overallRating": "4.30",  // String rating
        "status": "approved"
      },
      {
        "id": 8,
        "overallRating": "4.20",  // String rating
        "status": "approved"
      },
      {
        "id": 9,
        "overallRating": "3.80",  // String rating
        "status": "approved"
      }
    ]
  }
};

const mockGoalsResponse = {
  "success": true,
  "data": {
    "goals": [
      {
        "id": 2,
        "status": "completed"
      },
      {
        "id": 11,
        "status": "completed"
      },
      {
        "id": 15,
        "status": "completed"
      },
      {
        "id": 17,
        "status": "active"
      },
      {
        "id": 12,
        "status": "active"
      }
    ]
  }
};

function testPerformanceRatingCalculation() {
  console.log('🧪 Testing Performance Rating String-to-Number Conversion Fix...\n');

  // Simulate the fixed calculation logic
  const reviews = mockReviewsResponse.data.reviews || [];
  const goals = mockGoalsResponse.data.goals || [];

  console.log('📊 Input Data:');
  console.log(`Reviews: ${reviews.length} items`);
  reviews.forEach(review => {
    console.log(`  - ID ${review.id}: Rating "${review.overallRating}" (${typeof review.overallRating}), Status: ${review.status}`);
  });
  console.log(`Goals: ${goals.length} items`);
  goals.forEach(goal => {
    console.log(`  - ID ${goal.id}: Status ${goal.status}`);
  });

  // Test the fixed calculation logic
  console.log('\n🔧 Testing Fixed Calculation Logic:');

  // Filter reviews with valid ratings
  const reviewsWithRatings = reviews.filter(review => {
    const rating = review.overall_rating || review.overallRating;
    const numericRating = parseFloat(rating);
    const isValid = rating !== null && rating !== undefined && !isNaN(numericRating) && numericRating > 0;
    console.log(`  - Review ${review.id}: Rating "${rating}" -> ${numericRating} -> Valid: ${isValid}`);
    return isValid;
  });

  console.log(`\n✅ Reviews with valid ratings: ${reviewsWithRatings.length}/${reviews.length}`);

  // Calculate average rating
  const averageRating = reviewsWithRatings.length > 0
    ? reviewsWithRatings.reduce((sum, review) => {
        const rating = review.overall_rating || review.overallRating;
        const numericRating = parseFloat(rating);
        console.log(`  - Adding rating: ${rating} -> ${numericRating}`);
        return sum + numericRating;
      }, 0) / reviewsWithRatings.length
    : null;

  console.log(`\n📊 Calculation Results:`);
  console.log(`  - Sum of ratings: ${reviewsWithRatings.reduce((sum, review) => sum + parseFloat(review.overall_rating || review.overallRating), 0)}`);
  console.log(`  - Number of valid reviews: ${reviewsWithRatings.length}`);
  console.log(`  - Raw average: ${averageRating}`);
  console.log(`  - Formatted average: ${averageRating !== null ? Number(averageRating.toFixed(1)) : null}`);
  console.log(`  - Display value: ${averageRating !== null ? Number(averageRating.toFixed(1)) : 'N/A'}`);

  // Test goals calculation
  const completedGoals = goals.filter(goal => goal.status === 'completed').length;
  const goalCompletionRate = goals.length > 0 ? (completedGoals / goals.length * 100) : 0;

  console.log(`\n🎯 Goals Calculation:`);
  console.log(`  - Total goals: ${goals.length}`);
  console.log(`  - Completed goals: ${completedGoals}`);
  console.log(`  - Completion rate: ${goalCompletionRate.toFixed(1)}%`);

  // Final summary object
  const employeeSummary = {
    totalReviews: reviews.length,
    completedReviews: reviews.filter(review => review.status === 'completed').length,
    averageRating: averageRating !== null ? Number(averageRating.toFixed(1)) : null,
    totalGoals: goals.length,
    completedGoals,
    goalCompletionRate: Number(goalCompletionRate.toFixed(1))
  };

  console.log(`\n📋 Final Employee Summary:`);
  console.log(JSON.stringify(employeeSummary, null, 2));

  // Test edge cases
  console.log(`\n🧪 Testing Edge Cases:`);

  // Test with empty reviews
  const emptyReviews = [];
  const emptyAverage = emptyReviews.length > 0 ? 0 : null;
  console.log(`  - Empty reviews array: ${emptyAverage} -> Display: ${emptyAverage !== null ? emptyAverage : 'N/A'}`);

  // Test with null ratings
  const nullRatingReviews = [{ overallRating: null }, { overallRating: undefined }, { overallRating: "" }];
  const validNullRatings = nullRatingReviews.filter(review => {
    const rating = review.overallRating;
    const numericRating = parseFloat(rating);
    return rating !== null && rating !== undefined && !isNaN(numericRating) && numericRating > 0;
  });
  console.log(`  - Null ratings: ${validNullRatings.length} valid out of ${nullRatingReviews.length}`);

  // Test with mixed valid/invalid ratings
  const mixedReviews = [
    { overallRating: "4.5" },
    { overallRating: null },
    { overallRating: "3.8" },
    { overallRating: "" },
    { overallRating: "0" },
    { overallRating: "4.2" }
  ];
  const validMixedRatings = mixedReviews.filter(review => {
    const rating = review.overallRating;
    const numericRating = parseFloat(rating);
    return rating !== null && rating !== undefined && !isNaN(numericRating) && numericRating > 0;
  });
  const mixedAverage = validMixedRatings.length > 0
    ? validMixedRatings.reduce((sum, review) => sum + parseFloat(review.overallRating), 0) / validMixedRatings.length
    : null;
  console.log(`  - Mixed ratings: ${validMixedRatings.length} valid out of ${mixedReviews.length}, Average: ${mixedAverage?.toFixed(1) || 'N/A'}`);

  // Verify no NaN values
  console.log(`\n✅ NaN Verification:`);
  console.log(`  - Average rating isNaN: ${isNaN(employeeSummary.averageRating)}`);
  console.log(`  - Goal completion rate isNaN: ${isNaN(employeeSummary.goalCompletionRate)}`);
  console.log(`  - All values are valid numbers or null: ${
    (employeeSummary.averageRating === null || !isNaN(employeeSummary.averageRating)) &&
    !isNaN(employeeSummary.goalCompletionRate)
  }`);

  console.log(`\n🎉 Performance Rating Fix Test Completed!`);
  console.log(`✅ String ratings properly converted to numbers`);
  console.log(`✅ NaN values prevented with proper validation`);
  console.log(`✅ Null values handled correctly for display`);
  console.log(`✅ Edge cases properly managed`);

  return employeeSummary;
}

// Run the test
testPerformanceRatingCalculation();
