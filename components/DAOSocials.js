import Image from 'next/image';

export const DAOSocials = ({ room }) => <div className='flex items-center justify-center gap-2'>
  {room.twitterHandle &&
    <a className="flex" target="_blank" rel="noreferrer" href={`https://twitter.com/${room.twitterHandle?.replace('@', '')}`}>
      <Image height="18" width="18" src="/twitter.svg" alt="twitter-link"></Image>
    </a>}
  {room.discordServer &&
    <a className="flex" target="_blank" rel="noreferrer" href={room.discordServer}>
      <Image height="18" width="18" src="/discord.svg" alt="discord-link"></Image>
    </a>}
</div>;
