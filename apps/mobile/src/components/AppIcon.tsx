import {Image,View,useColorScheme} from 'react-native';
import {themeFor} from '../../../../packages/design/src/tokens';
import ai from '../features/shell/icons/ai.png';
import at from '../features/shell/icons/at.png';
import back from '../features/shell/icons/back.png';
import bell from '../features/shell/icons/bell.png';
import block from '../features/shell/icons/block.png';
import bookmark from '../features/shell/icons/bookmark.png';
import calendar from '../features/shell/icons/calendar.png';
import chat from '../features/shell/icons/chat.png';
import check from '../features/shell/icons/check.png';
import clock from '../features/shell/icons/clock.png';
import close from '../features/shell/icons/close.png';
import copy from '../features/shell/icons/copy.png';
import down from '../features/shell/icons/down.png';
import edit from '../features/shell/icons/edit.png';
import expand from '../features/shell/icons/expand.png';
import file from '../features/shell/icons/file.png';
import flag from '../features/shell/icons/flag.png';
import folder from '../features/shell/icons/folder.png';
import gif from '../features/shell/icons/gif.png';
import globe from '../features/shell/icons/globe.png';
import hash from '../features/shell/icons/hash.png';
import heart from '../features/shell/icons/heart.png';
import history from '../features/shell/icons/history.png';
import home from '../features/shell/icons/home.png';
import image from '../features/shell/icons/image.png';
import inbox from '../features/shell/icons/inbox.png';
import link from '../features/shell/icons/link.png';
import mic from '../features/shell/icons/mic.png';
import more from '../features/shell/icons/more.png';
import mute from '../features/shell/icons/mute.png';
import pin from '../features/shell/icons/pin.png';
import plus from '../features/shell/icons/plus.png';
import poll from '../features/shell/icons/poll.png';
import posts from '../features/shell/icons/posts.png';
import repost from '../features/shell/icons/repost.png';
import right from '../features/shell/icons/right.png';
import search from '../features/shell/icons/search.png';
import send from '../features/shell/icons/send.png';
import settings from '../features/shell/icons/settings.png';
import share from '../features/shell/icons/share.png';
import sliders from '../features/shell/icons/sliders.png';
import star from '../features/shell/icons/star.png';
import trash from '../features/shell/icons/trash.png';
import uninterested from '../features/shell/icons/uninterested.png';
import up from '../features/shell/icons/up.png';
import user from '../features/shell/icons/user.png';
import users from '../features/shell/icons/users.png';
import verified from '../features/shell/icons/verified.png';
import video from '../features/shell/icons/video.png';

import alert from '../features/account/icons/alert.png';
import desktop from '../features/account/icons/desktop.png';
import key from '../features/account/icons/key.png';
import phone from '../features/account/icons/phone.png';
import refresh from '../features/account/icons/refresh.png';
import shield from '../features/account/icons/shield.png';

const icons={alert,desktop,key,phone,refresh,shield,ai,at,back,bell,block,bookmark,calendar,chat,check,clock,close,copy,down,edit,expand,file,flag,folder,gif,globe,hash,heart,history,home,image,inbox,link,mic,more,mute,pin,plus,poll,posts,repost,right,search,send,settings,share,sliders,star,trash,uninterested,up,user,users,verified,video} as const;
export type AppIconName=keyof typeof icons;
export function AppIcon({name,size=24,color}:{name:AppIconName;size?:number;color?:string}){
  const colors=themeFor(useColorScheme());
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{width:size,height:size}}>
    <Image source={icons[name]} tintColor={color||colors.fg} resizeMode="contain" style={{width:size,height:size}}/>
  </View>;
}
