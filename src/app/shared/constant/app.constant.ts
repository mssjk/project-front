export const AppConstants = {
  ROUTES_WITHOUT_TOGGLE: ['/brokerage', '/home', '/register-daf', '/login'],
  ROUTES_WITH_ACCOUNT: ['/dashboard', '/add-donation', '/view-donation'],
  ROUTES_WITH_TRANSFERS: ['/viewtransfer', '/bdashboard'],
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  REGISTER_DAF: '/register-daf',
  HOME: '/home',
  ADD_DONATION: '/add-donation',
  VIEW_DONATION: '/view-donation',
  BROKERAGE: '/brokerage',
  BDASHBOARD: '/bdashboard',
  VIEWTRANSFER: '/viewtransfer',
  GRT_SWAL: 'Great!',
  GRT_SWAL_TITLE: 'Thank you for your donation!',

  SWAL_SUCCESS: 'success' as const, 
  SWAL_ERROR: 'error' as const,     
  SWAL_WARNING: 'warning' as const, 
  SWAL_INFO: 'info' as const,  
  SWAL_ERROR_TITLE: 'Error',
  SWAL_VALIDATION_ERROR: 'Validation Error',
  SWAL_INSUFFICIENT_BALANCE: 'Insufficient Balance',
  TOTAL_PERCENTAGE: 100, // Total percentage for donation distribution
  HIDE_CHARITY_LIST_TIMEOUT: 200, // Timeout for hiding charity list
  TIME: {
    MILLISECONDS_IN_A_DAY: 24 * 60 * 60 * 1000, 
    DURATION_24_HOURS: '24hours', 

  },
  DATE_FORMAT: {
    KEYS: {
      YEAR: 'year', 
      MONTH: 'month', 
      DAY: 'day', 
      HOUR: 'hour', 
      MINUTE: 'minute', 
    },
    VALUES: {
      YEAR: 'numeric', 
      MONTH: 'short', 
      DAY: 'numeric', 
      HOUR: '2-digit', 
      MINUTE: '2-digit', 
    },
  },
  LOCALE: {
    DEFAULT: 'en-US', 
  },


MESSAGES: {
  ERROR: {
    FETCH_BROKERAGE: 'Unable to fetch brokerage account details. Please try again later.',
    FETCH_TRANSFERS: 'Unable to fetch transfer details. Please try again later.',
    FETCH_DAF_ACCOUNT: 'Unable to fetch DAF account details. Please try again later.',
    INVALID_ACCOUNT: 'The provided DAF account number is invalid. Please check and try again.',
    TRANSFER_FAILED: 'An error occurred while processing your transfer. Please try again later.',
    VALIDATION_ERROR: 'Please fill in all required fields correctly.',
    INSUFFICIENT_BALANCE: 'You do not have enough balance to make this transfer.',
    USER_NOT_LOGGED_IN: 'User not logged in. Redirecting to login page.',
    INVALID_BROKERAGE_RESPONSE: 'Invalid response for brokerage account details.',
    INVALID_TRANSFER_RESPONSE: 'Invalid response for transfer details.',
    MODAL_NOT_FOUND: 'Unable to open the modal. Please try again.',
    FETCH_BROKERAGE_BALANCE: 'An unexpected error occurred while fetching brokerage balance.',
    FETCH_TOTAL_TRANSFERS: 'An unexpected error occurred while fetching total transfers.',
    FETCH_PREVIOUS_TRANSFERS: 'An unexpected error occurred while fetching previous transfers.',
    OPEN_TRANSFER_MODAL: 'An unexpected error occurred while opening the transfer modal.',
    LOGOUT_ERROR: 'An unexpected error occurred during logout. Please try again later.',
    HANDLING_ERROR: 'An error occurred while handling another error.',
    INITIALIZATION_ERROR: 'An unexpected error occurred during initialization. Please try again later.',
    INVALID_TRANSFER_DETAILS: 'Please provide a valid account number and amount.', 
    LOGIN_ERROR: 'An unexpected error occurred during login. Please try again later.',
    INVALID_CREDENTIALS: 'Invalid username or password.',
    FORMAT_DATE_ERROR: 'An error occurred while formatting the date. Please try again later.',
    FILTER_ERROR: 'An error occurred while filtering transfers. Please try again later.',
    CLEAR_FILTERS_ERROR: 'An error occurred while clearing filters. Please try again later.',
    TITLE: 'Error',
        
        FETCH_BROKERAGE_ACCOUNT: 'Error fetching brokerage account details.',
        FETCH_BROKERAGE_ACCOUNT_MESSAGE: 'Unable to fetch brokerage account details. Please try again later.',
        
        
        
        FETCH_DAF_ACCOUNTS: 'Error fetching DAF accounts.',
       
        INSUFFICIENT_BALANCE_TITLE: 'Insufficient Balance',
        INSUFFICIENT_BALANCE_MESSAGE: 'You do not have enough balance to make this transfer.',
        VALIDATION_TITLE: 'Validation Error',
        VALIDATION_MESSAGE: 'Please fill in all required fields correctly.',
        INVALID_ACCOUNT_TITLE: 'Invalid Account',
        INVALID_ACCOUNT_MESSAGE: 'The provided DAF account number is invalid. Please check and try again.',
        
        TRANSFER_FAILED_TITLE: 'Transfer Failed',
        TRANSFER_FAILED_MESSAGE: 'An error occurred while processing your transfer. Please try again later.',
        
        
        LOGOUT: 'Error during logout.',
        LOGOUT_TITLE: 'Logout Error',
        LOGOUT_MESSAGE: 'An error occurred during logout. Please try again.',
        INITIALIZATION_ERROR_TITLE: 'Initialization Error',
        INITIALIZATION_ERROR_MESSAGE: 'An error occurred during initialization. Please log in again.',
        TYPE_ERROR: 'Type error occurred.',
        REFERENCE_ERROR: 'Reference error occurred.',
        UNEXPECTED_ERROR: 'An unexpected error occurred.',
        VALIDATE_TRANSFER: 'Error validating transfer.',
        INITIATE_TRANSFER: 'Error initiating transfer.',
  

  
  },
  SUCCESS: {
    TRANSFER_SUCCESS: 'Your transfer has been completed successfully.',
    LOGIN_SUCCESS: 'Login Successful! Welcome ', 
    TRANSFER_INITIATED: 'Transfer has been initiated successfully.', 
    TRANSFER_SUCCESS_TITLE: 'Transfer Successful',
    TRANSFER_SUCCESS_MESSAGE: 'Your transfer has been completed successfully.',


  },
  TITLES: {
    ERROR: 'Error',
    SUCCESS: 'Success',
    WARNING: 'Warning',
    VALIDATION_ERROR: 'Validation Error',
    INSUFFICIENT_BALANCE: 'Insufficient Balance',
    TRANSFER_SUCCESS: 'Transfer Successful',
  },

  BUTTONS: {
    GO_TO_DASHBOARD: 'Go to Dashboard', 
  },
  INFO: {
    FILTERS_CLEARED: 'Filters have been cleared successfully.',
  },
},


DEFAULTS: {
  UNKNOWN_ACCOUNT: 'Unknown',
  CONFIRM_BUTTON_COLOR: '#005F83',
  SWEETALERT_WIDTH: '400px', 

},
MODAL: {
    TRANSFER_MODAL_ID: 'transferModal',
},
UNKNOWN: 'Unknown',


LOCAL_STORAGE_USER_ID: 'UserId',
LOCAL_STORAGE_USER_NAME: 'UserName',

MODAL_TRANSFER_ID: 'transferModal',

};

