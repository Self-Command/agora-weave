import { useLocalSearchParams } from 'expo-router';
import { ReportCreatePage } from '../src/features/reports/ReportCreatePage';

export default function ReportRoute(){
  const {kind,id}=useLocalSearchParams<{kind:string;id:string}>();
  return <ReportCreatePage targetKind={kind} targetId={id} />;
}
