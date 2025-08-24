

import { useUser } from '@clerk/clerk-react';
import ReactFlowComponent from '../components/ReactFlow';
import MindMapFlowSimple from '../components/MindMapFlowSimple';
import '@xyflow/react/dist/style.css';
import Markmap from '../components/Markmap';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Dashboard() {

const data = {
  "title": "Betty Davies (Radio Producer & Dramatist)",
  "children": [
    {
      "title": "Early Life & BBC Entry",
      "children": [
        {
          "title": "Born Elizabeth Gwladys Davies (1917-2018)"
        },
        {
          "title": "Education: English at University College London"
        },
        {
          "title": "Joined BBC in June 1939 as a secretary"
        },
        {
          "title": "Began writing for BBC programmes in 1943"
        }
      ]
    },
    {
      "title": "Career at the BBC",
      "children": [
        {
          "title": "Early Writing & Musicals",
          "children": [
            {
              "title": "Wrote for 'Children's Hour' and 'For the Forces'"
            },
            {
              "title": "Co-wrote musical 'Blow Your Own Trumpet!'"
            }
          ]
        },
        {
          "title": "Just the Job for Jones",
          "children": [
            {
              "title": "Satirical musical comedy about the BBC"
            },
            {
              "title": "Inspired by her work in Listener Research"
            }
          ]
        },
        {
          "title": "Mrs Dale's Diary (1953-1962)",
          "children": [
            {
              "title": "Joined as assistant producer, became main producer"
            },
            {
              "title": "Oversaw the BBC's first long-running serial drama"
            },
            {
              "title": "Defined the Dales as an 'idealised' middle-class family"
            }
          ]
        },
        {
          "title": "Mainstream Drama Producer",
          "children": [
            {
              "title": "Produced popular series like 'Midweek Theatre'"
            },
            {
              "title": "Directed a wide range of plays and serials"
            }
          ]
        }
      ]
    },
    {
      "title": "Directing Style & Collaborations",
      "children": [
        {
          "title": "Nickname: 'Betty the Hat'",
          "children": [
            {
              "title": "Known for stylish headwear and theatrical flair"
            },
            {
              "title": "Emphasized physical performance in radio acting"
            }
          ]
        },
        {
          "title": "Promotion of Welsh Writers",
          "children": [
            {
              "title": "Worked with Emlyn Williams, William Ingram, and Elizabeth Morgan"
            },
            {
              "title": "Addressed social issues like the 1911 Llanelly rail strike"
            }
          ]
        },
        {
          "title": "Champion of Caribbean Voices ('Black Betty')",
          "children": [
            {
              "title": "Produced 15 plays by Trinidadian author Samuel Selvon"
            },
            {
              "title": "Worked with writers Mustapha Matura and Michael Abbensetts"
            },
            {
              "title": "Cast actors like Rudolph Walker and Mona Hammond"
            }
          ]
        }
      ]
    },
    {
      "title": "Later Life & Legacy",
      "children": [
        {
          "title": "Continued working freelance after 1977 retirement"
        },
        {
          "title": "Produced for Capital Radio and created audiobooks"
        },
        {
          "title": "Dramatised 'David Copperfield' for BBC Radio 4 in 1991"
        },
        {
          "title": "Died in 2018, shortly before her 101st birthday"
        }
      ]
    }
  ]
};

  const mindMapData = data;


return (
  <>
    <section className='section min-h-50'>
        <div style={{ 
          width: '80%', 
          minHeight: '300px', 
          height: '80vh', 
          maxHeight: '100vh', 
          outline: '1px solid white', 
          outlineOffset: '2px', 
          borderRadius: '12px', 
          boxSizing: 'border-box', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'stretch',
          marginTop: '100px'
        }}>
          <MindMapFlowSimple 
            data={mindMapData} 
            xGap={300}
            yGap={120}
            maxVisibleDepth={100}
            style={{ width: '100%', height: '100%' }} 
          />
        </div>
        {/* <div style={{ width: "100%", height: "60vh", border: "2px solid royalblue", borderRadius: 12 }}>
          <ErrorBoundary fallbackMessage="The Markmap component failed to load. Please try refreshing the page.">
            <Markmap data={data} initialExpandLevel={2} />
          </ErrorBoundary>
        </div> */}
    </section>
    <section className='section min-h-50'>
      <h2>Other Content</h2>
    </section>
    <section className='section min-h-50'>
      <h2>Search</h2>
    </section>
  </>
);
}
