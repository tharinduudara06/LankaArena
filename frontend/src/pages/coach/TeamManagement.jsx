import React, { useEffect, useState } from 'react';
import './styles/TeamManagement.css';
import { Link, useNavigate } from 'react-router-dom';
import dashboard from '../../images/dashboard.png';
import managers from '../../images/managers.png';
import jersey from '../../images/jersey.png';
import attendance from '../../images/attendance.png';
import trophy from '../../images/trophy.png';
import sessions from '../../images/sessions.png';
import notification from '../../images/notification.png';
import settings from '../../images/settings.png';
import worker01 from '../../images/worker01.jpg';
import logout2 from '../../images/logout2.png';
import Coach_sideBar from './Coach_sideBar';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'

export default function TeamManagement() {

  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);

  const navigate = useNavigate();

  //###################### Get Teams ######################
  useEffect(() => {

    const fetchTeams = async () => {
      try {

        const res = await axios.get('http://localhost:8080/api/coach/get-team',
          {
            withCredentials: true
          }
        )

        if (res.status === 200) {
          setTeams(res.data.data);
        }

      } catch (error) {
        if (error.response) {
          if (error.response.status === 400) {
            navigate('/log');
            // alert("hiiiiiiiiiii");
          }
        }
        else if (error.response.status === 404) {
          console.log("No Teams");
        }
        else if (error.response.status === 500) {
          toast.error("Something went wrong!", {
            position: 'top-center',
            autoClose: 1500
          })
        }
      }
    }

    fetchTeams();
  }, [])

  //###################### Team Delete ######################
  const handleteamDelete = async (teamId) => {
    try {

      const res = await axios.delete(`http://localhost:8080/api/coach/delete-team/${teamId}`,
        { withCredentials: true }
      )

      if (res.status === 200) {
        setTeams(teams.filter(team => team._id !== teamId));
      }

    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          toast.error("something went wrong!",
            {
              position: 'top-center',
              autoClose: 1500
            }
          )
        }
        else if (error.response.status === 400) {
          navigate('/log');

        }
        else if (error.response.status === 500) {
          console.error(error);
        }
      }
    }
  }
//###################### Get Players of selected team ######################
  const handleSelectTeam = async (teamId) => {
    try {

      const res = await axios.get(`http://localhost:8080/api/coach/get-team-players/${teamId}`,
        { withCredentials: true }
      )

      if (res.status === 200) {
        setPlayers(res.data.data);
      }

    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          toast.error("No players found", { autoClose: 1500 });
        }
        else if (error.response.status === 500) {
          toast.error("Internal server error occured!", { autoClose: 1500 });
        }
      }
    }
  }

  //###################### Player Update ######################
  const handlePlayerUpdate = async (playerId) => {

      const playerToUpdate = players.find(p => p.id === playerId);

  try {
    const res = await axios.put(
      `http://localhost:8080/api/coach/edit-player/${playerId}`,
      {
        jersey: playerToUpdate.jersey,
        position: playerToUpdate.position,
        age: playerToUpdate.age,
        height: playerToUpdate.height,
        weight: playerToUpdate.weight
      },
      { withCredentials: true }
    );

    if (res.status === 200) {
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === playerId ? { ...p, isEditing: false } : p
        )
      );
      toast.success("Player updated!", { autoClose: 1500, position: "top-center" });
    }
  } catch (error) {
    if(error.response)
    {
      if(error.response.status === 404)
      {
        toast.error("Player Not Found",{autoClose:1500});
      }
      else if(error.response.status === 500)
      {
        toast.error("Internal sever error occured",{autoClose:1500});
      }
    }
  }

  }

  //###################### Player Delete ######################
  const handlePlayerDelete = async(playerId) =>
  {
      try {
        
        const res = await axios.delete(`http://localhost:8080/api/coach/delete-player/${playerId}`, { withCredentials: true });

        if (res.status === 200) {
      
          // setPlayers(players.filter(p => p.id !== playerId));
          // toast.success("Player deleted!", { autoClose: 1500});
          setTimeout(() => {
            window.location.reload();
          }, 10);
      }

      } catch (error) {
        if(error.response)
        {
          if(error.response.status === 404)
          {
            toast.error("Player Not Found!", { autoClose: 1500});
          }

          else if(error.response.status === 500)
          {
            toast.error("Internal server error occured!", { autoClose: 1500});
          }
        }
      }
  }

  return (
    <div>

      <Coach_sideBar />

      <ToastContainer/>

      <div className='team-management-container'>
        <div className="team-management-header">
          <div className="team-management-head-text">
            <p>Team Management</p>
          </div>

          <div className="team-management-header-btns">
            <button className="team-management-header-btn secondary">
              Export
            </button>
            <Link to='/coach-add-team' className="team-management-header-btn primary">
              + Add Team
            </Link>
          </div>
        </div>

        <div className="team-selection-cards">
          {teams.length > 0 ? (teams.map((team) => (

            <div key={team._id} className="c-team-selection-card">
              {team.isEditing ? (
                <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                  <input
                    type="text"
                    value={team.editName}
                    onChange={(e) =>
                      setTeams((prev) =>
                        prev.map((t) =>
                          t._id === team._id ? { ...t, editName: e.target.value } : t
                        )
                      )
                    }
                    autoFocus
                  />
                  <button style={{ padding: "0px 5px", cursor: "pointer", backgroundColor: "#008ab8ff", color: "white", border: "0", outline: "none", borderRadius: "3px" }}
                    onClick={() => {
                      axios
                        .put(
                          `http://localhost:8080/api/coach/update-team/${team._id}`,
                          { name: team.editName },
                          { withCredentials: true }
                        )
                        .then(() => {
                          setTeams((prev) =>
                            prev.map((t) =>
                              t._id === team._id
                                ? { ...t, name: t.editName, isEditing: false }
                                : t
                            )
                          );
                          toast.success("Team updated!", {
                            position: "top-center",
                            autoClose: 1500,
                          });
                        })
                        .catch(() => {
                          toast.error("Update failed!", {
                            position: "top-center",
                            autoClose: 1500,
                          });
                        });
                    }}
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <p className="c-team-name">{team.name}</p>
              )}

              <div className="c-team-selection-card-stats">
                <div className="c-team-stat">
                  <p>{team.player.length}</p>
                  <p>Players</p>
                </div>
                <div className="c-team-stat">
                  {!team.won ? <p>0</p> : <p>{team.won}</p>}
                  <p>Won</p>
                </div>
              </div>

              <div className="team-selection-card-btns">
                <button
                  onClick={() =>
                    setTeams((prev) =>
                      prev.map((t) =>
                        t._id === team._id
                          ? { ...t, isEditing: true, editName: team.name }
                          : t
                      )
                    )
                  }
                >
                  <FontAwesomeIcon style={{ color: "#00da5eff" }} icon={faEdit} />
                </button>

                <button onClick={() => handleSelectTeam(team._id)} className='team-selection-card-select-btn'>
                  Select
                </button>

                <button
                  onClick={() => handleteamDelete(team._id)}
                >
                  <FontAwesomeIcon style={{ color: "#ec2700ff" }} icon={faTrash} />
                </button>
              </div>
            </div>
          ))

          ) : (
            <div className="team-card-not">
              <h3>You Don't have any teams yet</h3>
              <p style={{ marginBottom: "10px" }} >Add your team</p>
              <Link to='/coach-add-team' className='team-card-not-link'>
                + Add Team
              </Link>
            </div>
          )}

        </div>

        <div className="team-management-content-section">
          <div className="content-section-header">

            <Link to='/coach-add-player' state={{ teams }} className="team-management-header-btn primary">
              + Add Player
            </Link>
          </div>

          <div className="table-controls">
            <div className="search-control">
              <input type="text" placeholder="Search players..." />
            </div>

          </div>

          <table className="roster-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Jersey number</th>
                <th>Position</th>
                <th>Age</th>
                <th>Height</th>
                <th>Weight</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {players.length > 0 ? (
              players.map((player) => (
                <tr key={player.id}>
                  <td>{player.name}</td>

                  {player.isEditing ? (
                    <>
                      <td>
                        <input
                          type="text"
                          value={player.jersey}
                          onChange={(e) =>
                            setPlayers((prev) =>
                              prev.map((p) =>
                                p.id === player.id ? { ...p, jersey: e.target.value } : p
                              )
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={player.position}
                          onChange={(e) =>
                            setPlayers((prev) =>
                              prev.map((p) =>
                                p.id === player.id ? { ...p, position: e.target.value } : p
                              )
                            )
                          }
                        />
                      </td>
                      <td>{player.age}</td>
                      <td>{player.height}</td>
                      <td>{player.weight}</td>
                      <td>
                        <button
                          onClick={() => handlePlayerUpdate(player.id)}
                          className='roster-table-action-save'
                        >
                          ✓
                        </button>
                        <button
                          onClick={() =>
                            setPlayers((prev) =>
                              prev.map((p) =>
                                p.id === player.id ? { ...p, isEditing: false } : p
                              )
                            )
                          }
                          className='roster-table-action-cancel'
                        >
                          ✕
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{player.jersey}</td>
                      <td>{player.position}</td>
                      <td>{player.age}</td>
                      <td>{player.height}</td>
                      <td>{player.weight}</td>
                      <td>
                        <button
                          onClick={() =>
                            setPlayers((prev) =>
                              prev.map((p) =>
                                p.id === player.id ? { ...p, isEditing: true } : p
                              )
                            )
                          }
                          className='roster-table-action-edit'
                        >
                          <FontAwesomeIcon style={{ color: "#00d370ff" }} icon={faEdit} />
                        </button>

                        <button onClick={() => handlePlayerDelete(player.id)} className='roster-table-action-delete'>
                          <FontAwesomeIcon style={{ color: "#d31c00ff" }} icon={faTrash} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>
                  No Players Found
                </td>
              </tr>
            )}
          </tbody>

          </table>

        </div>
      </div>
    </div>
  )
}