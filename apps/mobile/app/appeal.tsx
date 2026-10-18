import { useLocalSearchParams } from 'expo-router';
import { AppealCreatePage } from '../src/features/appeals/AppealCreatePage';
export default function AppealRoute(){
  const {sanctionId}=useLocalSearchParams<{sanctionId:string}>();
  return <AppealCreatePage sanctionId={sanctionId}/>;
}
