import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Payment } from './payment';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import * as fc from 'fast-check';

/**
 * Preservation Property Tests
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 * 
 * Property 2: Preservation - Payment Flow Unchanged
 * 
 * These tests verify that all non-cancel functionality works correctly on the UNFIXED code.
 * They capture the baseline behavior that must be preserved after the fix is implemented.
 * 
 * CRITICAL: These tests MUST PASS on unfixed code to establish the baseline behavior.
 * After the fix is implemented, these same tests must still pass (no regressions).
 */
describe('Payment - Preservation Property Tests', () => {
  let component: Payment;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockHttpClient: jasmine.SpyObj<HttpClient>;
  let mockActivatedRoute: any;
  let mockRazorpay: any;

  beforeEach(() => {
    // Create mocks
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockHttpClient = jasmine.createSpyObj('HttpClient', ['delete']);
    
    // Mock Razorpay
    mockRazorpay = {
      open: jasmine.createSpy('open')
    };
    
    // Make Razorpay available globally
    (window as any).Razorpay = jasmine.createSpy('Razorpay').and.returnValue(mockRazorpay);

    mockActivatedRoute = {
      snapshot: {
        queryParams: {
          orderId: '123',
          amount: '500'
        }
      }
    };

    // Configure TestBed
    TestBed.configureTestingModule({
      providers: [
        Payment,
        { provide: Router, useValue: mockRouter },
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    });

    component = TestBed.inject(Payment);
  });

  describe('Property 2: Preservation - Payment Flow Unchanged', () => {
    
    /**
     * Test: Page Initialization Preservation
     * Validates: Requirement 3.4
     * 
     * Property: For any valid order ID and amount in query parameters,
     * the page should load and display them correctly.
     */
    it('should initialize with order ID and amount from query parameters (property-based)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 999999 }), // orderId
          fc.integer({ min: 1, max: 100000 }), // amount
          (orderId, amount) => {
            // Setup: Create new component with random query params
            mockActivatedRoute.snapshot.queryParams = {
              orderId: orderId.toString(),
              amount: amount.toString()
            };
            
            const testComponent = TestBed.inject(Payment);
            
            // Act: Initialize component
            testComponent.ngOnInit();
            
            // Assert: Component should load with correct values
            expect(testComponent.orderId()).toBe(orderId);
            expect(testComponent.amount()).toBe(amount);
          }
        ),
        { numRuns: 10 } // Run 10 random test cases
      );
    });

    /**
     * Test: Cancel Dialog Rejection Preservation
     * Validates: Requirement 2.5
     * 
     * Property: When user clicks "Cancel" in the confirmation dialog,
     * the system should remain on the payment page without taking any action.
     */
    it('should do nothing when user rejects cancellation dialog (property-based)', () => {
      // Setup: Mock confirm to return false (user clicks "Cancel")
      const confirmSpy = spyOn(window, 'confirm').and.returnValue(false);
      
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 999999 }), // orderId
          (orderId) => {
            // Setup: Initialize component
            mockActivatedRoute.snapshot.queryParams = {
              orderId: orderId.toString(),
              amount: '500'
            };
            
            const testComponent = TestBed.inject(Payment);
            testComponent.ngOnInit();
            
            // Reset spies
            mockRouter.navigate.calls.reset();
            mockHttpClient.delete.calls.reset();
            
            // Act: User clicks Cancel button but rejects confirmation
            testComponent.cancel();
            
            // Assert: No HTTP DELETE should be called (deleteOrder not invoked)
            expect(mockHttpClient.delete).not.toHaveBeenCalled();
            expect(mockRouter.navigate).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 5 }
      );
    });

    /**
     * Test: Payment Flow Preservation
     * Validates: Requirement 3.1
     * 
     * Property: For any valid order ID and amount, clicking "Pay Now"
     * should initialize Razorpay with correct configuration.
     */
    it('should initialize Razorpay with correct options when Pay Now is clicked (property-based)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 999999 }), // orderId
          fc.integer({ min: 1, max: 100000 }), // amount
          (orderId, amount) => {
            // Setup: Initialize component with random values
            mockActivatedRoute.snapshot.queryParams = {
              orderId: orderId.toString(),
              amount: amount.toString()
            };
            
            const testComponent = TestBed.inject(Payment);
            testComponent.ngOnInit();
            
            // Act: User clicks Pay Now
            testComponent.pay();
            
            // Assert: Razorpay should be initialized with correct options
            expect((window as any).Razorpay).toHaveBeenCalled();
            const razorpayOptions = ((window as any).Razorpay as jasmine.Spy).calls.mostRecent().args[0];
            
            expect(razorpayOptions.key).toBe('rzp_live_SKIBqzqnSzSxL6');
            expect(razorpayOptions.amount).toBe(amount * 100);
            expect(razorpayOptions.currency).toBe('INR');
            expect(razorpayOptions.name).toBe('OrderProcessingSystem');
            expect(razorpayOptions.description).toBe(`Payment for Order #${orderId}`);
            expect(razorpayOptions.handler).toBeDefined();
            expect(razorpayOptions.modal).toBeDefined();
            expect(razorpayOptions.modal.ondismiss).toBeDefined();
            
            // Assert: Razorpay modal should be opened
            expect(mockRazorpay.open).toHaveBeenCalled();
          }
        ),
        { numRuns: 5 }
      );
    });

    /**
     * Test: Payment Success Handler Preservation
     * Validates: Requirement 3.2
     * 
     * Property: When payment is successful, the system should show
     * success message and redirect to user dashboard.
     */
    it('should handle successful payment correctly (property-based)', () => {
      // Setup: Mock alert once
      const alertSpy = spyOn(window, 'alert');
      
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 999999 }), // orderId
          fc.string({ minLength: 10, maxLength: 30 }), // paymentId
          (orderId, paymentId) => {
            // Setup: Initialize component
            mockActivatedRoute.snapshot.queryParams = {
              orderId: orderId.toString(),
              amount: '500'
            };
            
            const testComponent = TestBed.inject(Payment);
            testComponent.ngOnInit();
            
            // Reset spies
            alertSpy.calls.reset();
            mockRouter.navigate.calls.reset();
            ((window as any).Razorpay as jasmine.Spy).calls.reset();
            
            // Act: Trigger pay() to get Razorpay options
            testComponent.pay();
            const razorpayOptions = ((window as any).Razorpay as jasmine.Spy).calls.mostRecent().args[0];
            
            // Act: Simulate successful payment
            razorpayOptions.handler({ razorpay_payment_id: paymentId });
            
            // Assert: Should show success alert and redirect
            expect(alertSpy).toHaveBeenCalledWith(`Payment Successful! Payment ID: ${paymentId}`);
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/user']);
            expect(testComponent.loading()).toBe(false);
          }
        ),
        { numRuns: 5 }
      );
    });

    /**
     * Test: Modal Dismissal Preservation
     * Validates: Requirement 3.3
     * 
     * Property: When user dismisses the Razorpay modal, the system
     * should delete the order via deleteOrder().
     */
    it('should call deleteOrder when Razorpay modal is dismissed (property-based)', () => {
      // Setup: Mock alert once
      const alertSpy = spyOn(window, 'alert');
      
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 999999 }), // orderId
          fc.integer({ min: 1, max: 100000 }), // amount
          (orderId, amount) => {
            // Setup: Initialize component
            mockActivatedRoute.snapshot.queryParams = {
              orderId: orderId.toString(),
              amount: amount.toString()
            };
            
            const testComponent = TestBed.inject(Payment);
            testComponent.ngOnInit();
            
            // Reset spies
            mockHttpClient.delete.calls.reset();
            mockHttpClient.delete.and.returnValue(of({}));
            alertSpy.calls.reset();
            ((window as any).Razorpay as jasmine.Spy).calls.reset();
            
            // Act: Trigger pay() to get Razorpay options
            testComponent.pay();
            const razorpayOptions = ((window as any).Razorpay as jasmine.Spy).calls.mostRecent().args[0];
            
            // Act: Simulate modal dismissal
            razorpayOptions.modal.ondismiss();
            
            // Assert: Should call deleteOrder which makes HTTP DELETE request
            const expectedUrl = `https://order-processing-backend-production.up.railway.app/api/v1/orders/${orderId}`;
            expect(mockHttpClient.delete).toHaveBeenCalledWith(expectedUrl);
            expect(testComponent.loading()).toBe(false);
          }
        ),
        { numRuns: 5 }
      );
    });

    /**
     * Test: Loading State Preservation
     * Validates: Requirement 3.5
     * 
     * Property: The loading spinner should be managed correctly during
     * payment operations.
     */
    it('should manage loading state correctly during payment flow (property-based)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 999999 }), // orderId
          (orderId) => {
            // Setup: Initialize component
            mockActivatedRoute.snapshot.queryParams = {
              orderId: orderId.toString(),
              amount: '500'
            };
            
            const testComponent = TestBed.inject(Payment);
            testComponent.ngOnInit();
            
            // Assert: Initially not loading
            expect(testComponent.loading()).toBe(false);
            
            // Act: Start payment flow
            testComponent.pay();
            
            // Assert: Loading state is managed (set to true then false)
            // Note: In the current implementation, loading is set to false after rzp.open()
            expect(testComponent.loading()).toBe(false);
          }
        ),
        { numRuns: 5 }
      );
    });

    /**
     * Test: deleteOrder Method Preservation
     * Validates: Requirements 3.3
     * 
     * Property: The deleteOrder method should correctly delete orders,
     * show alert, and redirect for any valid order ID.
     */
    it('should delete order correctly via deleteOrder method (property-based)', () => {
      // Setup: Mock alert once
      const alertSpy = spyOn(window, 'alert');
      
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 999999 }), // orderId
          (orderId) => {
            // Setup: Initialize component
            mockActivatedRoute.snapshot.queryParams = {
              orderId: orderId.toString(),
              amount: '500'
            };
            
            const testComponent = TestBed.inject(Payment);
            testComponent.ngOnInit();
            
            // Reset spies
            mockHttpClient.delete.calls.reset();
            mockHttpClient.delete.and.returnValue(of({}));
            alertSpy.calls.reset();
            mockRouter.navigate.calls.reset();
            
            // Act: Call deleteOrder directly
            testComponent.deleteOrder();
            
            // Assert: Should make HTTP DELETE request
            const expectedUrl = `https://order-processing-backend-production.up.railway.app/api/v1/orders/${orderId}`;
            expect(mockHttpClient.delete).toHaveBeenCalledWith(expectedUrl);
            
            // Assert: Should show alert and redirect
            expect(alertSpy).toHaveBeenCalledWith('Order cancelled');
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/user']);
          }
        ),
        { numRuns: 5 }
      );
    });
  });
});
