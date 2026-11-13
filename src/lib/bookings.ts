import type { Place, MessageTemplate } from '../data/schema';
import { places, daysForPlace, templates, templateById } from './data';
import { addDays, diffDays } from './time';
import type { BookingStatus } from './store';

export interface Booking {
  place: Place;
  date: string;          // день поездки
  deadline: string;      // когда писать
  note: string;
  templates: MessageTemplate[];
}

export const bookingStatusMeta: Record<BookingStatus, { label: string; next: BookingStatus; className: string }> = {
  none: { label: 'Не писали', next: 'written', className: 'bg-surface-2' },
  written: { label: 'Написали', next: 'confirmed', className: 'bg-[#fff0c2] text-[#6b4d00] dark:bg-[#4d3d10] dark:text-[#ffe08a]' },
  confirmed: { label: 'Подтвердили', next: 'paid', className: 'bg-[#d5efe0] text-[#1f5b36] dark:bg-[#1f4630] dark:text-[#b4e6c7]' },
  paid: { label: 'Оплачено на месте', next: 'none', className: 'bg-[var(--color-jungle)] text-white' },
};

/** Дедлайн = дата дня в плане − bookAhead.daysBefore. */
export function bookingDeadline(dayDate: string, daysBefore: number): string {
  return addDays(dayDate, -daysBefore);
}

export function allBookings(): Booking[] {
  return places
    .filter((p) => p.bookAhead && daysForPlace.get(p.id)?.length)
    .map((p) => {
      const date = daysForPlace.get(p.id)![0];
      const tpls = [p.messageTemplateId, p.messageTemplateId && `${p.messageTemplateId}-car`]
        .map((id) => (id ? templateById.get(id) : undefined))
        .filter((t): t is MessageTemplate => !!t);
      return { place: p, date, deadline: bookingDeadline(date, p.bookAhead!.daysBefore), note: p.bookAhead!.note, templates: tpls };
    })
    .sort((a, b) => a.deadline.localeCompare(b.deadline));
}

export type Urgency = 'overdue' | 'soon' | 'later' | 'done';
export function urgency(b: Booking, status: BookingStatus, today: string): Urgency {
  if (status === 'confirmed' || status === 'paid') return 'done';
  const d = diffDays(b.deadline, today);
  if (d < 0) return 'overdue';
  if (d <= 3) return 'soon';
  return 'later';
}

export const unlinkedTemplates = () => templates.filter((t) => !places.some((p) => p.messageTemplateId === t.id) && !t.id.endsWith('-car'));
