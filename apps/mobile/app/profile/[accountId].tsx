import { useLocalSearchParams } from 'expo-router';
import { ProfilePage } from '../../src/features/profile/ProfilePage';

export default function PublicProfileRoute(){
  const {accountId}=useLocalSearchParams<{accountId:string}>();
  return <ProfilePage accountId={typeof accountId==='string'?accountId:''} />;
}
