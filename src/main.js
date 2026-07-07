import './styles/tokens.css';
import './styles/base.css';
import './styles/cv.css';
import './styles/terminal.css';
import './styles/story.css';
import { renderCV } from './cv/render.js';
import { initTerminal } from './terminal/terminal.js';
import { initStory } from './story/story.js';

renderCV(document.getElementById('cv-root'));
initTerminal();
initStory();

console.log(
  '%cwhile (alive) { learn(); }',
  'font-family: monospace; color: #2DE0B5; font-size: 14px;'
);
console.log('%cLooking at the source? Good instinct. The story is sealed — keys are issued personally.', 'font-family: monospace; color: #8A9491;');
