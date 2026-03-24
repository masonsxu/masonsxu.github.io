import { Player } from '@remotion/player'
import { ConstellationAnimation } from '../remotion/ConstellationAnimation'

export default function HeroConstellation() {
  return (
    <Player
      component={ConstellationAnimation}
      compositionWidth={400}
      compositionHeight={400}
      durationInFrames={300}
      fps={30}
      style={{ width: '100%', height: '100%' }}
      loop
      autoPlay
      controls={false}
      acknowledgeRemotionLicense
      numberOfSharedAudioTags={0}
    />
  )
}
