/* eslint-disable @typescript-eslint/no-misused-promises */

import {
  testAnalyzeTournament,
  testCreateBattle,
  testCreateTournament,
  testCreateTraining,
  testDeleteBattle,
  testDeleteTournament,
  testDeleteTraining,
  testTeamsRepository,
} from './actions';

const Page = () => {
  return (
    <div className="flex flex-col">
      <button onClick={testTeamsRepository}>
        Click me to test teamRepository
      </button>
      <button onClick={testCreateTournament}>
        Click me to test createTournament
      </button>
      <form className="flex flex-row" action={testDeleteTournament}>
        <label>Tournament id:</label>
        <input id="delete-t-input" name="id" />
        <button type="submit">Click me to test deleteTournament</button>
      </form>
      <button onClick={testAnalyzeTournament}>
        Click me to test analyze tournament
      </button>
      <button onClick={testCreateTraining}>
        Click me to test create training
      </button>
      <form className="flex flex-row" action={testDeleteTraining}>
        <label>Training id:</label>
        <input id="delete-t-input" name="id" />
        <button type="submit">Click me to test delete training</button>
      </form>
      <form className="flex flex-row" action={testCreateBattle}>
        <label>Training id:</label>
        <input id="delete-t-input" name="trainingId" />
        <button type="submit">Click me to test create battle</button>
      </form>
      <form className="flex flex-row" action={testDeleteBattle}>
        <label>Training id:</label>
        <input id="delete-t-input" name="trainingId" />
        <label>Battle id:</label>
        <input id="delete-t-input" name="battleId" />
        <button type="submit">Click me to test delete battle</button>
      </form>
    </div>
  );
};

export default Page;
