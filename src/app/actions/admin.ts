'use server';

import { adminDb } from '@/lib/firebase-admin';
import type { Customer } from '@/lib/store';

export async function fetchAdminCustomers(): Promise<Customer[]> {
  try {
    const snap = await adminDb.collection('users').get();
    const customers = snap.docs.map((doc) => {
      const data = doc.data();
      let joinDate = 'Unknown';
      if (data.joinDate && typeof data.joinDate.toDate === 'function') {
        joinDate = data.joinDate.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } else if (data.joinDate && data.joinDate._seconds) {
        joinDate = new Date(data.joinDate._seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } else if (data.joinDate) {
        joinDate = new Date(data.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }

      return {
        id: doc.id,
        name: data.name || 'Unknown',
        email: data.email || 'N/A',
        spent: data.spent || 0,
        orders: data.orders || 0,
        status: data.status || 'Active',
        joinDate,
        plan: data.plan || 'Free',
      } as Customer;
    });

    return customers.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
  } catch (error) {
    console.error('Error fetching admin customers:', error);
    return [];
  }
}

export async function saveAdminCustomer(customer: Customer, isNew: boolean): Promise<void> {
  try {
    const userRef = adminDb.collection('users').doc(customer.id);
    if (isNew) {
      await userRef.set({
        name: customer.name,
        email: customer.email,
        plan: customer.plan,
        status: customer.status,
        spent: customer.spent || 0,
        orders: customer.orders || 0,
        joinDate: new Date()
      });
    } else {
      await userRef.update({
        name: customer.name,
        email: customer.email,
        plan: customer.plan,
        status: customer.status,
        spent: customer.spent || 0,
        orders: customer.orders || 0
      });
    }
  } catch (error) {
    console.error('Error saving admin customer:', error);
    throw new Error('Failed to save customer');
  }
}

export async function deleteAdminCustomer(id: string): Promise<void> {
  try {
    await adminDb.collection('users').doc(id).delete();
  } catch (error) {
    console.error('Error deleting admin customer:', error);
    throw new Error('Failed to delete customer');
  }
}
