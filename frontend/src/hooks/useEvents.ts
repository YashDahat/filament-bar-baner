import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getEvents, EventDto } from '../services/eventService';

export function useEvents(): UseQueryResult<EventDto[], Error> {
  return useQuery<EventDto[], Error>({
    queryKey: ['events'],
    queryFn: getEvents,
  });
}