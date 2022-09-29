import { useEffect, useState } from "react";
import { Outlet, Link, useLoaderData, Form, redirect, NavLink, useNavigation, useSubmit, useNavigate } from "react-router-dom";
import { createContact, getContacts } from "../contacts";

export async function loader({ request }) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return { contacts, q };
}

export async function action() {
  const contact = await createContact();
  return redirect(`/contacts/${contact.id}/edit`);
}

export default function Root() {
  const { contacts, q } = useLoaderData();
  const [query, setQuery] = useState(q);
  const navigation = useNavigation();
  const submit = useSubmit();
  const navigate = useNavigate();
  // console.log('navigation state', JSON.stringify(navigation))
  const searching = navigation.location && new URLSearchParams(navigation.location.search).has('q');
  useEffect(() => {
    setQuery(q);
  }, [q]);

  const goRoot = (e) => {
    navigate('/');
  }
  return (
    <>
      <div id="sidebar">
        <h1 onClick={goRoot}>React Router Contacts</h1>
        <div>
          <Form id="search-form" role="search">
            <input
              id="q"
              aria-label="Search contacts"
              className={searching ? 'loading': ''}
              placeholder="Search"
              type="search"
              name="q"
              value={query || ''}
              onChange={(e) => {
                const isFirstSearch = q == null;

                setQuery(e.target.value);
                submit(e.currentTarget.form, {
                  replace: !isFirstSearch
                });
              }}
            />
            <div id="search-spinner" aria-hidden hidden={!searching} />
            <div className="sr-only" aria-live="polite"></div>
          </Form>
          <Form method="post">
            <button type="submit">New</button>
          </Form>
        </div>
        <nav>
          {contacts.length ? (
            <ul>
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <NavLink to={`contacts/${contact.id}`} className={({ isActive, isPending }) => isActive ? 'active' : isPending ? 'pending' : ""}>
                    {contact.first || contact.last ? (
                      <>
                        {contact.first} {contact.last}
                      </>
                    ) : (
                      <i>No Name</i>
                    )}{" "}
                    {contact.favorite && <span>★</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <i>No contacts</i>
            </p>
          )}
        </nav>
      </div>
      <div id="detail" className={navigation.state === 'loading' ? 'loading' : ''}>
        <Outlet />
      </div>
    </>
  );
}