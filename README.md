# 💰 Personal Finance Manager

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Active-success.svg)
![Platform](https://img.shields.io/badge/platform-Web-orange.svg)

**Master your money, master your life.** 
The Personal Finance Manager is a robust web application designed to help users track their income and expenses, visualize spending habits, and achieve financial freedom. Built with a modern, clean interface and powered by secure cloud storage.

## ✨ Features

*   **🔒 Secure Authentication**: Complete user system with Sign Up, Login, and Password Recovery powered by Supabase.
*   **📊 Interactive Dashboard**: Get a snapshot of your financial health with real-time summary cards for Income, Expenses, Balance, and Savings Rate.
*   **📉 Visual Analytics**: Beautiful visualizations breakdown your expenses by category to identify spending patterns.
*   **💸 Transaction Management**: Easily add, edit, delete, and search your daily transactions.
*   **👤 User Profile**: Manage your account settings, update profile details, or change functionality securely.
*   **📱 Fully Responsive**: A seamless experience across desktop, tablet, and mobile devices.

## 🚀 Tech Stack

*   **Frontend**: HTML5, CSS3, JavaScript (ES6+)
*   **Styling**: Bootstrap 5 + Custom CSS
*   **Backend / Database**: Supabase (PostgreSQL + Auth)
*   **Icons**: FontAwesome
*   **Charts**: Chart.js

## 🛠️ Installation & Setup

Follow these steps to get a local copy running:

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/mrperfect2641/personal-finance-manager.git
    cd personal-finance-manager
    ```

2.  **Configure Supabase**
    *   Create a project at [Supabase](https://supabase.com).
    *   Run the provided SQL scripts (in `migrations/` or based on schema) to create `profiles` and `transactions` tables.
    *   Enable Email Auth provider in Supabase Dashboard.

3.  **Environment Variables**
    *   Open `config.js` and update the keys with your project credentials:
        ```javascript
        const SUPABASE_URL = "YOUR_SUPABASE_URL";
        const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";
        ```

4.  **Run the App**
    *   Simply open `index.html` in your browser (Live Server recommended for best experience).

## 📂 Project Structure

```
personal-finance-manager/
├── index.html          # Landing Page
├── dashboard.html      # Main Application Dashboard
├── login.html          # Login Page
├── signup.html         # Registration Page
├── style.css           # Global Styles
├── script.js           # Core Application Logic
├── config.js           # Supabase Configuration
├── login.js            # Login Logic
└── signup.js           # Signup Logic
```
## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.


