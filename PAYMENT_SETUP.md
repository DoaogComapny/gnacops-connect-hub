# Paystack Payment Setup Guide

## Production Configuration

Your payment system is now ready for production! Here's what has been set up:

### ✅ Completed Setup

1. **Payment Gateway**: Paystack integration with live keys
2. **Edge Functions**: 
   - `initialize-payment`: Creates payment sessions
   - `paystack-webhook`: Handles payment verification
3. **Security**: Auth password protection enabled
4. **Payment Flow**: Full end-to-end payment processing

### 🔧 Paystack Webhook Configuration

To receive real-time payment confirmations, configure your Paystack webhook:

1. **Log in to Paystack Dashboard**: https://dashboard.paystack.com/
2. **Navigate to Settings > Webhooks**
3. **Add this webhook URL**:
   ```
   https://zrxvgamrqodzhidelmzx.supabase.co/functions/v1/paystack-webhook
   ```
4. **Events to enable**:
   - `charge.success` (Required)
   
5. **Save the configuration**

### 💳 Payment Features

- **Secure Initialization**: Payments are initialized through backend edge function
- **Real-time Verification**: Webhook automatically updates payment status
- **Currency**: GHS (Ghana Cedis)
- **Redirect Flow**: Users are redirected to Paystack and back to your site
- **Status Tracking**: Complete payment history with status updates

### 🧪 Testing

#### Test Mode
To test payments before going live:
1. In Admin Settings > Payment, temporarily use Paystack test keys:
   - Test Public Key: `pk_test_...`
   - Test Secret Key: `sk_test_...`
2. Use Paystack test cards: https://paystack.com/docs/payments/test-payments/

#### Live Mode
Your current setup uses live keys and is production-ready!

### 📊 Admin Features

Monitor payments in:
- **Admin Panel**: Dashboard shows total revenue
- **Backend Database**: View `payments` table for detailed records

### 🔒 Security Notes

- Payment keys are stored securely in the backend
- RLS policies protect payment data
- Webhook signature verification prevents fraud
- HTTPS enforced on all payment endpoints

### 💡 User Flow

1. User selects membership
2. Fills out registration form
3. Application reviewed by admin
4. User proceeds to payment page
5. Enters contact details
6. Redirected to Paystack
7. Completes payment
8. Redirected back with confirmation
9. Membership status updated to "paid"
10. Certificate becomes available

---

**Support**: If you need assistance, check Paystack documentation at https://paystack.com/docs
