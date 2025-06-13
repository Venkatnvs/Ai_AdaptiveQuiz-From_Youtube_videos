from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['email', 'first_name','last_name', 'is_active', 'is_staff', 'is_completed']
    search_fields = ['email', 'first_name','last_name']
    list_filter = ['is_active', 'is_staff', 'is_completed','is_socialaccount']

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_completed','is_socialaccount','groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password'),
        }),
    )

    ordering = ['email']

admin.site.register(CustomUser, CustomUserAdmin)
