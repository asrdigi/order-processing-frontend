import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Payment } from './payment';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

/**
 * Bug Condition Exploration Test
 * 
 * **Validates: Requirements 2.2, 2.3, 2.4**
 * 
 * Property 1: Fault Condition - Cancel Button Deletes Order
 * 
 * This test encodes the EXPECTED behavior: when a user clicks "Cancel" and confirms
 * the dialog, the order should be deleted via deleteOrder().
 * 
 * CRITICAL: This test MUST FAIL on unfixed code (empty if block in cancel() method).
 * The failure confirms the bug exists.
 * 
 * Expected counterexample: confirm() returns true but deleteOrder() is never called.
 */
describe('Payment - Bug Condition Exploration', () => {
  let component: Payment;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockHttpClient: jasmine.SpyObj<HttpClient>;
  let mockActivatedRoute: any;

  beforeEach(() => {
    // Create mocks
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockHttpClient = jasmine.createSpyObj('HttpClient', ['delete']);
    mockActivatedRoute = {
      snapshot: {
        queryParams: {
          orderId: '123',
          amount: '500'
        }
      }
    };

    // Configure TestBed with proper providers
    TestBed.configureTestingModule({
      providers: [
        Payment,
        { provide: Router, useValue: mockRouter },
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    });

    // Create component instance through TestBed
    component = TestBed.inject(Payment);
    component.ngOnInit();
  });

  describe('Property 1: Fault Condition - Cancel Button Deletes Order', () => {
    it('should call deleteOrder() when user confirms cancellation', () => {
      // Setup: Mock confirm to return true (user clicks "OK")
      spyOn(window, 'confirm').and.returnValue(true);
      
      // Setup: Mock HTTP delete to return success
      mockHttpClient.delete.and.returnValue(of({}));
      
      // Setup: Spy on deleteOrder to verify it's called
      spyOn(component, 'deleteOrder').and.callThrough();

      // Act: User clicks Cancel button and confirms
      component.cancel();

      // Assert: deleteOrder() should be invoked
      // THIS WILL FAIL ON UNFIXED CODE - the if block is empty
      expect(component.deleteOrder).toHaveBeenCalled();
    });

    it('should send HTTP DELETE request to API when cancellation is confirmed', () => {
      // Setup: Mock confirm to return true
      spyOn(window, 'confirm').and.returnValue(true);
      
      // Setup: Mock HTTP delete
      mockHttpClient.delete.and.returnValue(of({}));
      
      // Setup: Mock alert
      spyOn(window, 'alert');

      // Act: User clicks Cancel and confirms
      component.cancel();

      // Assert: HTTP DELETE should be sent to correct endpoint
      // THIS WILL FAIL ON UNFIXED CODE
      const expectedUrl = `https://order-processing-backend-production.up.railway.app/api/v1/orders/${component.orderId()}`;
      expect(mockHttpClient.delete).toHaveBeenCalledWith(expectedUrl);
    });

    it('should show "Order cancelled" alert when cancellation is confirmed', () => {
      // Setup: Mock confirm to return true
      spyOn(window, 'confirm').and.returnValue(true);
      
      // Setup: Mock HTTP delete
      mockHttpClient.delete.and.returnValue(of({}));
      
      // Setup: Mock alert
      spyOn(window, 'alert');

      // Act: User clicks Cancel and confirms
      component.cancel();

      // Assert: Alert should show "Order cancelled"
      // THIS WILL FAIL ON UNFIXED CODE
      expect(window.alert).toHaveBeenCalledWith('Order cancelled');
    });

    it('should redirect to /user when cancellation is confirmed', () => {
      // Setup: Mock confirm to return true
      spyOn(window, 'confirm').and.returnValue(true);
      
      // Setup: Mock HTTP delete
      mockHttpClient.delete.and.returnValue(of({}));

      // Act: User clicks Cancel and confirms
      component.cancel();

      // Assert: Should redirect to user dashboard
      // THIS WILL FAIL ON UNFIXED CODE
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/user']);
    });

    it('should do nothing when user cancels the confirmation dialog', () => {
      // Setup: Mock confirm to return false (user clicks "Cancel")
      spyOn(window, 'confirm').and.returnValue(false);
      
      // Setup: Spy on deleteOrder
      spyOn(component, 'deleteOrder');

      // Act: User clicks Cancel button but rejects confirmation
      component.cancel();

      // Assert: deleteOrder() should NOT be called
      // This should PASS even on unfixed code
      expect(component.deleteOrder).not.toHaveBeenCalled();
    });
  });
});
