'use client';
import EventsFragment from '@/app/components/admin/fragments/EventsFragment';

export default function CoordinatorEventsFragment() {
  // Coordinators and Admins share the same modern events management UI
  return <EventsFragment />;
}
