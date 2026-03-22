import { Composition } from 'remotion'
import { TechCardVideo } from './TechCardVideo'
import { OpenSourceDashboard } from './OpenSourceDashboard'
import { ArchitectureEvolution } from './ArchitectureEvolution'
import { GitHubHeatmap } from './GitHubHeatmap'
import { PortfolioTrailer } from './PortfolioTrailer'

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="tech-card"
        component={TechCardVideo}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={450}
      />
      <Composition
        id="oss-dashboard"
        component={OpenSourceDashboard}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={600}
        defaultProps={{ data: {
          repoName: 'cloudwego-microservice-demo',
          stars: 3, prs: 4, merged: 3, agentsMdLines: 331,
        }}}
      />
      <Composition
        id="arch-evolution"
        component={ArchitectureEvolution}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={750}
      />
      <Composition
        id="github-heatmap"
        component={GitHubHeatmap}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={600}
      />
      <Composition
        id="portfolio-trailer"
        component={PortfolioTrailer}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={1800}
      />
    </>
  )
}
