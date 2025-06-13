import { configureStore } from '@reduxjs/toolkit';

// Import slices
import authSlice from './slices/authSlice';
import dashboardSlice from './slices/dashboardSlice';
import employeesSlice from './slices/employeesSlice';
import attendanceSlice from './slices/attendanceSlice';
// import attendanceSlice from './slices/attendanceSlice';
// import leaveSlice from './slices/leaveSlice';
// import payrollSlice from './slices/payrollSlice';
// import performanceSlice from './slices/performanceSlice';
// import aiSlice from './slices/aiSlice';
// import reportsSlice from './slices/reportsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    dashboard: dashboardSlice,
    employees: employeesSlice,
    attendance: attendanceSlice,
    // attendance: attendanceSlice,
    // leave: leaveSlice,
    // payroll: payrollSlice,
    // performance: performanceSlice,
    // ai: aiSlice,
    // reports: reportsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
