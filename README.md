# 🎫 Swift Pass

Swift Pass is an open-source, event ticketing and pass-issuing platform built with React. It streamlines registration for individuals and groups while providing seamless QR code validation at event entrances. 

Data is stored securely using serverless **Vercel KV / Upstash Redis**, making it fast, lightweight, and incredibly easy to deploy.

---

## 🚀 Key Features

* **Quick Registration**: Sign up individual attendees or large groups in seconds.
* **Instant Pass Issuing**: Automatically generate unique digital entry passes.
* **QR Code Validation**: Scan and verify attendee passes at the door using any camera-enabled device.
* **Serverless Storage**: Powered by Upstash Redis on Vercel for instant data updates.
* **Open & Forkable**: Clean architecture designed for easy customization and self-hosting.

---

## 🛠️ Tech Stack

* **Frontend**: React (Next.js / Vite)
* **Database**: Upstash Redis (Vercel KV)
* **Styling**: Tailwind CSS
* **Deployment**: Vercel

---

## 💻 Getting Started

Follow these steps to get the project running locally on your computer.

### Prerequisites

Ensure you have the following installed:
* **Node.js** (v18.0.0 or higher)
* **npm** or **yarn**
* An **Upstash Redis** account or a **Vercel KV** database

### 1. Clone the repository

```bash
git clone https://github.com
cd swift-pass
```

### 2. Environment Setup

Create a file named `.env.local` in the root directory of your project and add your Redis credentials:

```env
KV_REST_API_URL="https://upstash.io"
KV_REST_API_TOKEN="your_upstash_redis_token_here"
```

### 3. Install Dependencies

```bash
npm install
# or
yarn install
```

### 4. Run the Development Server

```bash
npm run dev
# or
npm start
```

Open your browser and navigate to `http://localhost:3000` (or the port specified in your terminal) to view the application.

---

## 🍴 Forking & Contributing

We welcome contributions to make Swift Pass even faster and more feature-rich!

1. **Fork** the project repository.
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`).
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`).
4. **Push** to the branch (`git push origin feature/AmazingFeature`).
5. **Open** a Pull Request against the main branch.

---

## 📄 License

This project is open-source software licensed under the **MIT License**. Feel free to use, modify, and distribute it commercially or privately.
