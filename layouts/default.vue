<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <NuxtLink to="/" class="text-xl font-bold text-blue-600">Ứng dụng chia tiền</NuxtLink>
          
          <nav class="flex space-x-4">
            <NuxtLink to="/" class="text-gray-600 hover:text-blue-600">Trang chủ</NuxtLink>
            <NuxtLink to="/admin" class="text-gray-600 hover:text-blue-600">Quản lý DB</NuxtLink>
          </nav>
        </div>
      </div>
    </header>
    
    <!-- Main content -->
    <main>
      <slot />
    </main>
    
    <!-- Footer -->
    <footer class="bg-white mt-8 py-4 border-t">
      <div class="container mx-auto px-4 text-center text-gray-500 text-sm">
        &copy; {{ new Date().getFullYear() }} Ứng dụng chia tiền - Được tạo bởi Replit
      </div>
    </footer>
  </div>
</template>