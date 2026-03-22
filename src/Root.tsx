import { Composition } from 'remotion'
import { AmbientArchitecture } from './remotion/AmbientArchitecture'

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AmbientArchitecture"
        component={AmbientArchitecture}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  )
}