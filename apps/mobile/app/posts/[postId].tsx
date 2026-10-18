import {useLocalSearchParams} from 'expo-router';
import {FeedHome} from '../../src/features/feed/FeedHome';

export default function ProfilePostDetail() {
  const {postId}=useLocalSearchParams<{postId:string}>();
  return <FeedHome initialPostId={typeof postId==='string'?postId:undefined}/>;
}
