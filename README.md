# 🍰 Cake Shop Online Ordering Website (MVP)

A fully functional **online cake ordering web application** where customers can browse cakes, add them to cart, and place orders online.
The system also includes a simple **admin dashboard** to view and manage customer orders.

This project is designed as a **Minimum Viable Product (MVP)** for a bakery business and demonstrates full-stack web development using modern technologies.

---

# 🚀 Features

## Customer Features

* Browse available cakes
* View cake details
* Select cake weight
* Add cakes to cart
* Enter message for cake
* Checkout with delivery details
* Place online order
* Order confirmation with Order ID

## Admin Features

* Admin login
* View all orders
* View customer details
* View ordered items
* Update order status

Order status types:

* New
* Preparing
* Completed
* Delivered

---

# 🧰 Tech Stack

Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

Backend / Database

* Supabase (PostgreSQL)

Hosting

* Vercel / Render

---

# 🗂 Project Structure

```
cake-shop-website/
│
├── app/
│   ├── page.tsx
│   ├── cakes/
│   ├── cart/
│   ├── checkout/
│   ├── order-confirmation/
│   └── admin/
│
├── components/
│   ├── Navbar.tsx
│   ├── CakeCard.tsx
│   ├── CartItem.tsx
│   └── OrderTable.tsx
│
├── lib/
│   └── supabaseClient.ts
│
├── types/
│   └── database.ts
│
└── README.md
```

---

# 🗄 Database Schema

## Cakes Table

| Column      | Type      |
| ----------- | --------- |
| id          | uuid      |
| name        | text      |
| description | text      |
| price       | numeric   |
| category    | text      |
| image_url   | text      |
| created_at  | timestamp |

---

## Orders Table

| Column        | Type      |
| ------------- | --------- |
| id            | uuid      |
| customer_name | text      |
| phone         | text      |
| address       | text      |
| delivery_date | date      |
| instructions  | text      |
| status        | text      |
| total_price   | numeric   |
| created_at    | timestamp |

---

## Order Items Table

| Column          | Type    |
| --------------- | ------- |
| id              | uuid    |
| order_id        | uuid    |
| cake_id         | uuid    |
| weight          | text    |
| quantity        | integer |
| message_on_cake | text    |
| price           | numeric |

---

# ⚙️ Environment Variables

Create a `.env.local` file and add:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

You can get these from your Supabase project settings.

---

# 🧪 Sample Cakes (Seed Data)

Example cakes included in the database:

* Chocolate Truffle
* Black Forest
* Red Velvet
* Butterscotch
* Pineapple Cake
* Photo Cake

---

# 💻 Installation

Clone the repository:

```
git clone https://github.com/yourusername/cake-shop-website.git
```

Go into the project directory:

```
cd cake-shop-website
```

Install dependencies:

```
npm install
```

Run the development server:

```
npm run dev
```

Open in browser:

```
http://localhost:3000
```

---

# ☁️ Deployment

Frontend Deployment
You can deploy the project easily using **Vercel**.

Steps:

1. Push the project to GitHub
2. Import the repository in Vercel
3. Add environment variables
4. Deploy the project

Database
Create tables in Supabase and connect using the provided environment variables.

---

# 📈 Future Improvements

Possible features for future versions:

* Online payment integration
* WhatsApp order notifications
* Customer login system
* Order tracking
* Cake customization with image upload
* Discount coupon system
* Delivery tracking

---

# 🤝 Contributing

Contributions are welcome.

If you would like to improve this project, feel free to fork the repository and submit a pull request.

---

# 📄 License

This project is open-source and available under the MIT License.

---

# 👨‍💻 Author

Developed by **Abhijit Jadhav**

Aspiring Full Stack Web Developer building modern web applications and SaaS platforms.
